"""Extrae capítulos de Amor con aroma a café desde el .docx original (sin modificar texto)."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

DOCX_PATH = Path(
    r"c:\Users\Usuario\AppData\Local\Packages\5319275A.WhatsAppDesktop_cv1g1gvanyjgm"
    r"\LocalState\sessions\F8D4B08EF20FFB63959C03C7271937D081E40735"
    r"\transfers\2026-32\amor con aroma TEXTO.docx"
)
OUT_JSON = Path(__file__).parent / "pedro-amor-cafe-chapters.json"
OUT_TS = Path(__file__).parent.parent / "src" / "data" / "pedro-amor-cafe-chapters.ts"
BOOK_ID = "pedro-amor-cafe"

CHAPTER_PATTERN = re.compile(
    r"^cap[ií]tulo\s+(\d+)\s*[—–\-]+\s*(.*)$",
    re.IGNORECASE,
)


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

    def flush() -> None:
        nonlocal current
        if current is not None:
            current["paragraphCount"] = len(current["content"])
            chapters.append(current)
        current = None

    for para in paragraphs:
        match = CHAPTER_PATTERN.match(para.strip())
        if match:
            flush()
            current = {
                "number": int(match.group(1)),
                "title": match.group(2).strip(),
                "content": [],
            }
            continue

        if current is not None:
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
        "/** Capítulos de Amor con aroma a café — manuscrito de Pedro García Martínez */",
        "export const pedroAmorCafeChapters: Chapter[] = [",
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

    OUT_JSON.write_text(
        json.dumps(chapters, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    write_ts(chapters)

    total_ast = sum(p.count("*") for ch in chapters for p in ch["content"])
    total_paras = sum(len(ch["content"]) for ch in chapters)
    print(f"Capítulos: {len(chapters)}")
    print(f"Párrafos: {total_paras}")
    print(f"Asteriscos: {total_ast}")
    print(f"JSON: {OUT_JSON}")
    print(f"TS:   {OUT_TS}")


if __name__ == "__main__":
    main()
