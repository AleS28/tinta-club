import json
import re
from pathlib import Path

json_path = Path(__file__).parent / "pedro-amor-cafe-chapters.json"
out_path = Path(__file__).parent.parent / "src" / "data" / "pedro-amor-cafe-chapters.ts"

chapters = json.loads(json_path.read_text(encoding="utf-8"))


def ts_string(s: str) -> str:
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    s = re.sub(r"[\r\n]+", " ", s)
    return f'"{s}"'


lines = [
    'import type { Chapter } from "./mock";',
    "",
    "/** Capítulos de Amor con aroma a café — manuscrito de Pedro García Martínez */",
    "export const pedroAmorCafeChapters: Chapter[] = [",
]

for ch in chapters:
    num = ch["number"]
    is_premium = "true" if num > 3 else "false"
    title = ch["title"].replace('"', '\\"')
    lines.append("  {")
    lines.append(f'    id: "pedro-amor-cafe-cap-{num}",')
    lines.append('    bookId: "pedro-amor-cafe",')
    lines.append(f"    number: {num},")
    lines.append(f'    title: "{title}",')
    lines.append(f"    isPremium: {is_premium},")
    lines.append("    content: [")
    for paragraph in ch["content"]:
        lines.append(f"      {ts_string(paragraph)},")
    lines.append("    ],")
    lines.append("  },")

lines.append("];")
lines.append("")

out_path.write_text("\n".join(lines), encoding="utf-8")
print(f"Written {out_path} ({out_path.stat().st_size} bytes, {len(chapters)} chapters)")
