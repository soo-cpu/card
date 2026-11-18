#!/usr/bin/env python3
"""상세 자동견적 빌드: 단가·원가를 암호화해 한 파일 HTML로 만든다.

단가·원가·계정 자료는 이 저장소(공개)에 두지 않는다. DATA 폴더(로컬)에서 읽는다.
  DATA/prices.json   [{id, proc, name, spec, unit, price, cost?}]
  DATA/rules.json    {progressPct, mgmtPerPy, ...}
  DATA/recipe.json   {procs:[{key,name,def,lines:[{id|name+price, qty, grades?, when?, note?}]}]}
  DATA/stats.json    {id: {n, med, min, max}}
  DATA/users.json    [{name, role: "staff"|"cost"}]  (비밀번호는 빌드 때 새로 만듦)
  DATA/meta.json     {priceSrc, statSrc, statSites, aboutHtml, version, procStats?}
사용: python3 build.py DATA OUT.html PASSWORDS.md
"""
import base64, hashlib, json, os, secrets, sys, datetime
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ITER = 600_000
ALPHA = "abcdefghjkmnpqrstuvwxyz23456789"  # 헷갈리는 글자(i l o 0 1) 뺌

b64 = lambda b: base64.b64encode(b).decode()

def seal(key, obj):
    iv = os.urandom(12)
    data = obj if isinstance(obj, bytes) else json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode()
    return {"iv": b64(iv), "ct": b64(AESGCM(key).encrypt(iv, data, None))}

def kek(pw, salt):
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode())

def gen_pw():
    return "-".join("".join(secrets.choice(ALPHA) for _ in range(4)) for _ in range(4))

def main(data_dir, out_html, pw_file):
    L = lambda n: json.load(open(os.path.join(data_dir, n), encoding="utf-8"))
    prices, rules, recipe, stats, users, meta = (L(n) for n in
        ("prices.json", "rules.json", "recipe.json", "stats.json", "users.json", "meta.json"))
    if "indirect" in rules:  # 단가 추출 결과(rules.json) 그대로 받으면 간접비 값만 꺼냄
        ind = rules["indirect"]
        rules = {k: ind[k]["value"] for k in ("progressPct", "mgmtPerPy", "cleanPerPy")}
    proc_name = {"demolition": "철거", "plumbing": "설비", "sash": "창호", "carpentry": "목공", "electric": "전기·조명",
                 "tile": "타일", "bath": "욕실", "wallpaper": "도배", "floor": "바닥", "film": "필름", "paint": "도장",
                 "furniture": "가구", "misc": "기타"}
    proc_name.update({p["key"]: p["name"] for p in recipe["procs"]})
    sale = {
        "prices": {p["id"]: {k: p.get(k) for k in ("proc", "name", "spec", "unit", "price")} for p in prices},
        "rules": rules, "recipe": recipe, "stats": stats, "procName": proc_name,
        "meta": {k: meta[k] for k in ("priceSrc", "statSrc", "statSites")}, "aboutHtml": meta["aboutHtml"],
        "procStats": meta.get("procStats", {}),
    }
    cost = {"cost": {p["id"]: p["cost"] for p in prices if p.get("cost") is not None}}
    dk_s, dk_c = AESGCM.generate_key(256), AESGCM.generate_key(256)
    gsalt = secrets.token_hex(8)
    slots, pw_rows = {}, []
    for u in users:
        name = u["name"].replace(" ", "")
        pw = gen_pw()
        salt = os.urandom(16)
        k = kek(pw, salt)
        slot = {"salt": b64(salt), "iter": ITER, "role": u["role"], "s": seal(k, dk_s)}
        if u["role"] == "cost":
            slot["c"] = seal(k, dk_c)
        sid = hashlib.sha256(f"hf-dq|{gsalt}|{name}".encode()).hexdigest()
        slots[sid] = slot
        pw_rows.append((u["name"], "원가·마진 보기" if u["role"] == "cost" else "직원 (원가 안 보임)", pw))
    payload = {
        "meta": {"version": meta["version"], "built": datetime.date.today().isoformat(), "salt": gsalt},
        "slots": slots, "encS": seal(dk_s, sale), "encC": seal(dk_c, cost),
    }
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "template.html"), encoding="utf-8").read()
    js = json.dumps(payload, ensure_ascii=False).replace("</", "<\\/")
    open(out_html, "w", encoding="utf-8").write(tpl.replace("/*__PAYLOAD__*/", js))
    with open(pw_file, "w", encoding="utf-8") as f:
        f.write(f"# 상세 자동견적 {meta['version']} 계정 (대표 전용 · 공유 금지)\n\n")
        f.write("각 직원에게 본인 줄만 따로 전달하세요. 파일을 다시 빌드하면 비밀번호가 모두 바뀝니다.\n\n")
        f.write("| 이름 | 권한 | 비밀번호 |\n|---|---|---|\n")
        for r in pw_rows:
            f.write(f"| {r[0]} | {r[1]} | `{r[2]}` |\n")
    print(f"ok: {len(prices)} prices, {len(cost['cost'])} costs, {len(slots)} users -> {out_html}")

if __name__ == "__main__":
    main(*sys.argv[1:4])
