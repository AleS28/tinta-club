"""Extrae capítulos de LA CHICA DEL CAFÉ desde un .docx local."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

DOCX_PATH = Path(__file__).parent / "la-chica-del-cafe.docx"
OUT_JSON = Path(__file__).parent / "will-chica-cafe-chapters.json"
OUT_TS = Path(__file__).parent.parent / "src" / "data" / "will-chica-cafe-chapters.ts"
BOOK_ID = "will-chica-cafe"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def read_paragraphs(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path) as z:
        xml = z.read("word/document.xml")
    root = ET.fromstring(xml)
    paragraphs: list[str] = []
    for para in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
        texts: list[str] = []
        for node in para.iter():
            if node.tag.endswith("}t") and node.text:
                texts.append(node.text)
            if node.tag.endswith("}t") and node.tail:
                texts.append(node.tail)
        line = "".join(texts).strip()
        if line:
            paragraphs.append(line)
    return paragraphs


def split_into_chapters(paragraphs: list[str]) -> list[dict]:
    """Divide el cuento en capítulos por encabezados o bloques de párrafos."""
    chapter_pattern = re.compile(
        r"^(?:cap[íi]tulo|chapter)\s*(\d+)[\s:.\-–—]*(.*)$",
        re.IGNORECASE,
    )

    chapters: list[dict] = []
    current: dict | None = None

    def flush():
        nonlocal current
        if current and current["content"]:
            chapters.append(current)
        current = None

    for para in paragraphs:
        match = chapter_pattern.match(para)
        if match:
            flush()
            num = int(match.group(1))
            title = match.group(2).strip() or f"Capítulo {num}"
            current = {"number": num, "title": title, "content": []}
            continue

        if current is None:
            num = len(chapters) + 1
            current = {"number": num, "title": f"Capítulo {num}", "content": []}

        current["content"].append(para)

    flush()

    if not chapters:
        # Cuento continuo: repartir en bloques ~4 párrafos
        chunk_size = max(3, len(paragraphs) // 6 or 1)
        for i in range(0, len(paragraphs), chunk_size):
            num = len(chapters) + 1
            chunk = paragraphs[i : i + chunk_size]
            title = chunk[0][:60] + ("…" if len(chunk[0]) > 60 else "")
            chapters.append({"number": num, "title": title, "content": chunk})

    return chapters


def to_ts_string(value: str) -> str:
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    value = re.sub(r"[\r\n]+", " ", value)
    return f'"{value}"'


def write_ts(chapters: list[dict]) -> None:
    lines = [
        'import type { Chapter } from "./mock";',
        "",
        '/** Capítulos de La chica del café — WillFlechas */',
        "export const willChicaCafeChapters: Chapter[] = [",
    ]
    for ch in chapters:
        num = ch["number"]
        is_premium = "true" if num > 1 else "false"
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
            lines.append(f"      {to_ts_string(paragraph)},")
        lines.extend(["    ],", "  },"])
    lines.extend(["];", ""])
    OUT_TS.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    import sys

    if "--from-json" in sys.argv or not DOCX_PATH.exists():
        if not OUT_JSON.exists():
            raise SystemExit(f"No se encontró {OUT_JSON} ni un .docx válido en {DOCX_PATH}.")
        chapters = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        write_ts(chapters)
        print(f"✓ {len(chapters)} capítulos (desde JSON) → {OUT_TS}")
        return

    try:
        with zipfile.ZipFile(DOCX_PATH):
            pass
    except zipfile.BadZipFile as exc:
        raise SystemExit(
            f"{DOCX_PATH} no es un .docx válido (¿descargaste la página HTML?). "
            "Abre el enlace en WPS, descarga el archivo original y vuelve a ejecutar."
        ) from exc

    paragraphs = read_paragraphs(DOCX_PATH)
    chapters = split_into_chapters(paragraphs)
    OUT_JSON.write_text(json.dumps(chapters, ensure_ascii=False, indent=2), encoding="utf-8")
    write_ts(chapters)
    print(f"✓ {len(chapters)} capítulos → {OUT_TS}")


if __name__ == "__main__":
    main()
