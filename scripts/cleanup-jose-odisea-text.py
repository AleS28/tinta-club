"""Limpia metadatos de revisión y corrige errores ortográficos frecuentes."""
import json
import re
from pathlib import Path

JSON_PATH = Path(__file__).parent / "jose-odisea-robot-chapters.json"
OUT_TS = Path(__file__).parent.parent / "src" / "data" / "jose-odisea-robot-chapters.ts"
BOOK_ID = "jose-odisea-robot-guerra"

REVISION_LINE = re.compile(
    r"^(ultima|última)\s+revisi[oó]n|^revisado\s+el\s+",
    re.IGNORECASE,
)

FIXES: list[tuple[str, str]] = [
    (r"\bLo se amigó\b", "Lo sé, amigo"),
    (r"\blo se amigó\b", "lo sé, amigo"),
    (r"\bNo lo se\b", "No lo sé"),
    (r"\blo se amigó\b", "lo sé, amigo"),
    (r"\byo se defenderme\b", "yo sé defenderme"),
    (r"\bsilenció\b", "silencio"),
    (r"\bsonrío\b", "sonrió"),
    (r"\bsonrio\b", "sonrió"),
    (r"\beso escuche\b", "eso escuché"),
    (r"\babra dado\b", "habrá dado"),
    (r"\ba tención\b", "atención"),
    (r"\bemos intentado\b", "hemos intentado"),
    (r"\bensañarle\b", "enseñarle"),
    (r"\bmas y mas\b", "más y más"),
    (r"\bcrecía mas\b", "crecía más"),
    (r"\bfutbol\b", "fútbol"),
    (r"\biba hacía\b", "iba hacia"),
    (r"\bdonde tu estabas\b", "donde tú estabas"),
    (r"\bsi mismo\b", "sí mismo"),
    (r"\binfra estructura\b", "infraestructura"),
    (r"\ba estado\b", "ha estado"),
    (r"\bSe que\b", "Sé que"),
    (r"\bse por qué\b", "sé por qué"),
    (r"\bQue bueno\b", "Qué bueno"),
    (r"\bcomprendi\b", "comprendió"),
    (r"\benvisti[oó]\b", "embistió"),
    (r"\bmas importante\b", "más importante"),
    (r"\bpermitira\b", "permitirá"),
    (r"\bhar[aá] ahora\b", "hará ahora"),
    (r"\bcompre la última\b", "compré la última"),
    (r"\bburlate\b", "búrlate"),
    (r"\bbarlate\b", "búrlate"),
    (r"\bdecayó mientras\b", "decaía mientras"),
    (r"\bel hubiera\b", "él hubiera"),
    (r"\bSi\. –\b", "Sí. –"),
    (r"\bSi\. -\b", "Sí. -"),
    (r"\bSi\. – Hubo\b", "Sí. – Hubo"),
    (r"\bSi -responde\b", "Sí, responde"),
    (r"\bSi – dijo\b", "Sí – dijo"),
    (r"\bSi – contestó\b", "Sí – contestó"),
    (r"\bSi – respondió\b", "Sí – respondió"),
    (r"\bSi – Entonces\b", "Sí – Entonces"),
    (r"\bSi – volteó\b", "Sí – volteó"),
    (r"\bSi – respondió\b", "Sí – respondió"),
    (r"^Si, ", "Sí, "),
    (r"^Si – ", "Sí – "),
    (r"^Si jijiji", "Sí, jijiji"),
    (r"^Si casi", "Sí, casi"),
    (r"^Si exacto", "Sí, exacto"),
    (r"^Si vamos", "Sí, vamos"),
    (r"^Si nena", "Sí, nena"),
    (r"^Si ese es", "Sí, ese es"),
    (r"^Si hijo", "Sí, hijo"),
    (r"^Si mama", "Sí, mamá"),
    (r"^Si papa", "Sí, papá"),
    (r"^Si señor", "Sí, señor"),
    (r"^Si le pica tanto", "Si le pica tanto"),  # condicional: no tocar
    (r"^Si necesitas", "Si necesitas"),
    (r"^Si presentas", "Si presentas"),
    (r"^Si tal vez", "Si tal vez"),
    (r"^Si de consuelo", "Si de consuelo"),
    (r"^Si el robot recibe", "Si el robot recibe"),
    (r"^Si no les importa", "Si no les importa"),
    (r"^Si puedes", "Si puedes"),
    (r"^Si quieres", "Si quieres"),
    (r"^Si tan solo", "Sí, tan solo"),
    (r"^Si realmente", "Sí, realmente"),
    (r"^Si un", "Sí, un"),
    (r"^Si puedo", "Sí, puedo"),
    (r"^Si creo", "Sí, creo"),
    (r"^Si ni", "Sí, ni"),
    (r"^Si amigo", "Sí, amigo"),
    (r"^Si ya", "Sí, ya"),
    (r"^Si todo", "Sí, todo"),
    (r"^Si Robert", "Sí, Robert"),
    (r"^Si el\b", "Sí, el"),
    (r"^Si en\b", "Sí, en"),
    (r"^Si no\b", "Sí, no"),
    (r"^Si te\b", "Sí, te"),
    (r"^Si tu\b", "Sí, tu"),
    (r"^Si puedes\b", "Si puedes"),
    (r"^Si yo también", "Sí, yo también"),
    (r"^Si se encuentra bien", "Sí, se encuentra bien"),
    (r"^Si aquí lo tengo", "Sí, aquí lo tengo"),
    (r"^Si esta bien", "Sí, está bien"),
    (r"^Si esta bien,", "Sí, está bien,"),
    (r"^Si me especialicé", "Sí, me especialicé"),
    (r"^Si Satoshi, sé", "Sí, Satoshi, sé"),
    (r"^Si Satoshi –", "Sí, Satoshi –"),
    (r"^Si amor,", "Sí, amor,"),
    (r"^Si respondió", "Sí – respondió"),
    (r"^Si quiero,", "Sí, quiero,"),
    (r"^Si veras,", "Sí, verás,"),
    (r"^Si estuvo rica", "Sí, estuvo rica"),
    (r"^Si me encanta", "Sí, me encanta"),
    (r"^Si huele delicioso", "Sí, huele delicioso"),
    (r"^Si que lo es", "Sí, que lo es"),
    (r"^Si Yui,", "Sí, Yui,"),
    (r"^Si muchas gracias", "Sí, muchas gracias"),
    (r"^Si es Yui", "Sí, es Yui"),
    (r"^Si denos un momento", "Sí, denos un momento"),
    (r"^Si sé que Satoshi", "Sí, sé que Satoshi"),
    (r"\bestas llevando\b", "estás llevando"),
    (r"\ble enseñe a la\b", "le enseñé a la"),
    (r"\bno puedo obtener conciencia\b", "no pueda obtener conciencia"),
    (r"\bno halla de que\b", "no haya de qué"),
    (r"\btu piensas\b", "tú piensas"),
    (r"\bconflicto armando\b", "conflicto armado"),
    (r"\bconcentraban es esa\b", "concentraban en esa"),
    (r"\bSolo se feliz\b", "Sé feliz"),
    (r"\bperdóname es que\b", "perdóname, es que"),
    (r"Por cierto, quieres", "Por cierto, ¿quieres"),
    (r"el robot puedo hacer", "el robot puede hacer"),
    (r"¿porque no", "¿por qué no"),
    (r"¿Porque ", "¿Por qué "),
]


def cleanup_paragraph(text: str) -> str | None:
    stripped = text.strip()
    if REVISION_LINE.match(stripped):
        return None

    result = text
    for pattern, replacement in FIXES:
        result = re.sub(pattern, replacement, result)
    return result


def ts_string(value: str) -> str:
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    value = re.sub(r"[\r\n]+", " ", value)
    return f'"{value}"'


def write_ts(chapters: list[dict]) -> None:
    lines = [
        'import type { Chapter } from "./mock";',
        "",
        "/** Una odisea a través del tiempo: Un robot para la guerra — José Luis Grimaldo */",
        "export const joseOdiseaRobotChapters: Chapter[] = [",
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
    chapters = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    removed = 0
    fixed = 0

    for ch in chapters:
        cleaned: list[str] = []
        for para in ch["content"]:
            original = para
            result = cleanup_paragraph(para)
            if result is None:
                removed += 1
                continue
            if result != original:
                fixed += 1
            cleaned.append(result)
        ch["content"] = cleaned

    JSON_PATH.write_text(json.dumps(chapters, ensure_ascii=False, indent=2), encoding="utf-8")
    write_ts(chapters)
    print(f"Líneas de revisión eliminadas: {removed}")
    print(f"Párrafos corregidos: {fixed}")
    print(f"TS regenerado: {OUT_TS}")


if __name__ == "__main__":
    main()
