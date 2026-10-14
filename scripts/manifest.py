import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
files=[]
for p in sorted(root.rglob('*')):
 if not p.is_file() or any(x in p.parts for x in ('.git','node_modules','.vercel')) or p.name=='FILE_MANIFEST.json':continue
 b=p.read_bytes();files.append(dict(path=p.relative_to(root).as_posix(),bytes=len(b),sha256=hashlib.sha256(b).hexdigest()))
(root/'FILE_MANIFEST.json').write_text(json.dumps(dict(project='TechRef',revision='navigation-10-2026-10-14',files=files),indent=2)+'\n')
