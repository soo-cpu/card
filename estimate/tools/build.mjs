// 단가표(data.json) → estimate/rates.js (묶음 금액) + estimate/prices.enc.js (항목 단가, 암호화)
import fs from "node:fs"; import vm from "node:vm"; import { webcrypto as C } from "node:crypto";
const [,, dataPath, repo, pwPath] = process.argv;
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(repo + "/estimate/choices.js", "utf8") + ";this.EST=EST", ctx);
const EST = ctx.EST, I = Object.fromEntries(data.items.map(i => [i.k, i]));
const all = [];
EST.GROUPS.forEach(g => g.opts.forEach(o => all.push([g.id + ":" + o.id, o.items])));
Object.entries(EST.COMMON).forEach(([k, v]) => all.push([k, v.items]));
const rates = {}, missing = [];
for (const [id, items] of all) {
  if (!items.length) continue;
  const r = { f: 0, p: 0, b: 0, d: 0, h: 0 };
  for (const [k, rule] of items) {
    const it = I[k]; if (!it) { missing.push(id + ":" + k); continue; }
    if (rule === "py") r.p += it.price; else if (rule === "bath") r.b += it.price; else if (rule === "doors") r.d += it.price; else if (rule === "hpy") r.h += it.price; else r.f += it.price * Number(rule);
  }
  for (const k in r) { r[k] = Math.round(r[k] / 1000) * 1000; if (!r[k]) delete r[k]; }
  rates[id] = r;
}
if (missing.length) { console.error("단가표에 없는 항목:", missing); process.exit(1); }
const stamp = new Date().toISOString().slice(0, 10);
fs.writeFileSync(repo + "/estimate/rates.js",
  "/* 자동 생성 " + stamp + " · " + data.ver + "\n   선택지 묶음 금액 계수 (부가세 포함). 항목별 단가는 들어 있지 않습니다. 직접 고치지 말고 단가표에서 다시 만드세요. */\nvar EST_RATES=" + JSON.stringify({ ver: data.ver, date: stamp, r: rates }) + ";\n");
// 암호화
const enc = new TextEncoder();
const b64 = u => Buffer.from(u).toString("base64");
const K = C.getRandomValues(new Uint8Array(32));
const key = await C.subtle.importKey("raw", K, "AES-GCM", false, ["encrypt"]);
const payload = { ver: data.ver, date: stamp, items: data.items.map(i => ({ k: i.k, space: i.space, name: i.name, desc: i.desc, unit: i.unit, qty: i.qty, price: i.price })) };
const iv = C.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(payload))));
const people = JSON.parse(fs.readFileSync(pwPath, "utf8"));
const users = [];
for (const p of people) {
  const salt = C.getRandomValues(new Uint8Array(16)), iv2 = C.getRandomValues(new Uint8Array(12));
  const base = await C.subtle.importKey("raw", enc.encode(p.pw), "PBKDF2", false, ["deriveKey"]);
  const kek = await C.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 200000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const w = new Uint8Array(await C.subtle.encrypt({ name: "AES-GCM", iv: iv2 }, kek, K));
  users.push({ id: p.id, name: p.name, title: p.title, salt: b64(salt), iv: b64(iv2), w: b64(w) });
}
fs.writeFileSync(repo + "/estimate/prices.enc.js",
  "/* 자동 생성 " + stamp + " · 항목별 단가 (암호화됨). 승인 화면에서 직원 비밀번호로만 열립니다. */\nvar EST_PRICES=" + JSON.stringify({ ver: data.ver, date: stamp, iter: 200000, users, iv: b64(iv), ct: b64(ct) }) + ";\n");
console.log("ok", Object.keys(rates).length, "묶음,", data.items.length, "항목");
