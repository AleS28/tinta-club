"""Extrae capítulos de El Títere desde el .docx original (sin modificar texto)."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

DOCX_PATH = Path(
    r"c:\Users\Usuario\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm"
    r"\LocalState\sessions\F8D4B08EF20FFB63959C03C7271937D081E40735"
    r"\transfers\2026-32\El titere.docx"
)
OUT_JSON = Path(__file__).parent / "pedro-el-titere-chapters.json"
OUT_TS = Path(__file__).parent.parent / "src" / "data" / "pedro-el-titere-chapters.ts"
BOOK_ID = "pedro-el-titere"

CHAPTER_PATTERN = re.compile(
    r"^cap[ií]tulo\s+(\d+)\s*:\s*(.+)$",
    re.IGNORECASE,
)


def is_toc_entry(title: str) -> bool:
    """Entradas de tabla de contenido terminan con número de página pegado."""
    return bool(re.search(r"\d+$", title.strip()))


def read_paragraphs(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    paragraphs: list[str] = []
    for para in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts: list[str] = []
        for node in para.iter():
            if node.tag.endswith("}t"):
                if node.text:
                    texts.append(node.text)
                if node.tail:
                    texts.append(node.tail)
        line = "".join(texts)
        if line:
            paragraphs.append(line)
    return paragraphs


def split_into_chapters(paragraphs: list[str]) -> list[dict]:
    chapters: list[dict] = []
    current: dict | None = None
    started = False

    def flush() -> None:
        nonlocal current
        if current is not None:
            current["paragraphCount"] = len(current["content"])
            chapters.append(current)
        current = None

    for para in paragraphs:
        match = CHAPTER_PATTERN.match(para.strip())
        if match:
            title = match.group(2).strip()
            if is_toc_entry(title):
                continue
            started = True
            flush()
            current = {
                "number": int(match.group(1)),
                "title": title,
                "content": [],
            }
            continue

        if started and current is not None:
            current["content"].append(para)

    flush()
    return chapters


def ts_string(value: str) -> str:
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    value = re.sub(r"[\r\n]+", " ", value)
    return f'"{value}"'


def write_ts(chapters: list[dict]) -> None:
    lines = [
        'import type { Chapter } from "./mock";',
        "",
        "/** Capítulos de El Títere: La llamada de Nyarl'kthar — Pedro García Martínez */",
        "export const pedroElTitereChapters: Chapter[] = [",
    ]
    for ch in chapters:
        num = ch["number"]
        is_premium = "true" if num > 3 else "false"
        title = ch["title"].replace('"', '\\"')
        lines.extend(
            [
                "  {",
                f'    id: "{BOOK_ID}-cap-{num}",',
                f'    bookId: "{BOOK_ID}",',
                f"    number: {num},",
                f'    title: "{title}",',
                f"    isPremium: {is_premium},",
                "    content: [",
            ]
        )
        for paragraph in ch["content"]:
            lines.append(f"      {ts_string(paragraph)},")
        lines.extend(["    ],", "  },"])
    lines.extend(["];", ""])
    OUT_TS.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    if not DOCX_PATH.exists():
        raise SystemExit(f"No se encontró el manuscrito: {DOCX_PATH}")

    paragraphs = read_paragraphs(DOCX_PATH)
    chapters = split_into_chapters(paragraphs)

    if not chapters:
        raise SystemExit("No se detectaron capítulos en el documento.")

    nums = [ch["number"] for ch in chapters]
    expected = list(range(1, max(nums) + 1))
    missing = [n for n in expected if n not in nums]
    if missing:
        raise SystemExit(f"Faltan capítulos: {missing}")

    OUT_JSON.write_text(
        json.dumps(chapters, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_ts(chapters)

    total_paras = sum(len(ch["content"]) for ch in chapters)
    print(f"Capítulos: {len(chapters)}")
    print(f"Párrafos: {total_paras}")
    print(f"JSON: {OUT_JSON}")
    print(f"TS:   {OUT_TS}")


if __name__ == "__main__":
    main()
