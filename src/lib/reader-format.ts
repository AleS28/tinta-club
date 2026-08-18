export type ReaderSegmentKind =
  | "narrative"
  | "message"
  | "note"
  | "scene-break"
  | "dialogue"
  | "quote";

export interface ReaderSegment {
  kind: ReaderSegmentKind;
  text: string;
}

const SCENE_BREAK = /^\*+$/;

const BLOCK_MESSAGE_PREV =
  /(?:abri[óo]\s+el\s+mensaje|escribi[óo]\s+(?:su\s+respuesta|un\s+mensaje)|envi[óo]\s+(?:un(?:\s+[úu]ltimo)?\s+mensaje|su\s+respuesta)|La respuesta de .+ no tard[óo] en llegar|mensaje de .+|nota dec[ií]a|el mensaje dec[ií]a|la nota dec[ií]a|mensaje en la pantalla|contest[óo] por escrito|escribi[óo] por (?:chat|whatsapp|mensaje))[^.?!]*:?\s*$/i;

const NOTE_PREV =
  /(?:nota dec[ií]a|la nota dec[ií]a|el papel dec[ií]a|escrito dec[ií]a|cartel dec[ií]a|dec[ií]a)\s*:?\s*$/i;

const QUOTE_OPEN_CHARS = ["\u201c", "\u201d", "\u00ab", '"'];
const QUOTE_CLOSE_CHARS = ["\u201d", "\u201c", "\u00bb", '"'];
const DASH_CHARS = ["\u2014", "\u2013", "-"];

function charClass(chars: string[]): string {
  return [...new Set(chars)]
    .map((ch) => `\\u${(ch.codePointAt(0) ?? 0).toString(16).padStart(4, "0")}`)
    .join("");
}

const QUOTE_OPEN_CLASS = charClass(QUOTE_OPEN_CHARS);
const QUOTE_CLOSE_CLASS = charClass(QUOTE_CLOSE_CHARS);
const DASH_CLASS = charClass(DASH_CHARS);
const SPOKEN_DIALOGUE = new RegExp(`^[${DASH_CLASS}]`);

const FULLY_QUOTED = new RegExp(`^[${QUOTE_OPEN_CLASS}]([\\s\\S]+)[${QUOTE_CLOSE_CLASS}]$`);
const INLINE_MESSAGE = new RegExp(
  `^([\\s\\S]*?)(?:te mandar[éé]|mandar[éé]|enviar[éé])\\s+un mensaje:\\s*([${QUOTE_OPEN_CLASS}][\\s\\S]+?[${QUOTE_CLOSE_CLASS}])([\\s\\S]*)$`,
  "i",
);

function normalize(text: string): string {
  return text.replace(/\u00a0/g, " ").trim();
}

function stripQuotes(text: string): string {
  return text.replace(new RegExp(`^[${QUOTE_OPEN_CLASS}]+|[${QUOTE_CLOSE_CLASS}]+$`, "g"), "").trim();
}

function stripDialogueMark(text: string): string {
  return text.replace(new RegExp(`^[${DASH_CLASS}]\\s*`), "").trim();
}

function isBlockMessage(text: string, prevText?: string): boolean {
  const current = normalize(text);
  const prev = prevText ? normalize(prevText) : "";

  if (!current || SCENE_BREAK.test(current) || SPOKEN_DIALOGUE.test(current)) {
    return false;
  }

  if (prev && BLOCK_MESSAGE_PREV.test(prev)) return true;

  if (
    FULLY_QUOTED.test(current) &&
    /mensaje|celular|tel[eé]fono|escribi[óo]|envi[óo]|mand[óo]|pantalla|whatsapp|sms/i.test(prev)
  ) {
    return true;
  }

  return false;
}

function isBlockNote(text: string, prevText?: string): boolean {
  const current = normalize(text);
  const prev = prevText ? normalize(prevText) : "";

  if (!current || SCENE_BREAK.test(current) || SPOKEN_DIALOGUE.test(current)) {
    return false;
  }

  return !!prev && NOTE_PREV.test(prev);
}

function splitEmDashDialogue(text: string): ReaderSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const hasDash = new RegExp(`[${DASH_CLASS}]`).test(trimmed);
  if (!hasDash) {
    return [{ kind: "narrative", text: trimmed }];
  }

  if (SPOKEN_DIALOGUE.test(trimmed)) {
    return [{ kind: "dialogue", text: stripDialogueMark(trimmed) }];
  }

  const inlineMatch = trimmed.match(new RegExp(`^(.*?)\\s[${DASH_CLASS}]\\s*([\\s\\S]+)$`));
  if (!inlineMatch) {
    return [{ kind: "narrative", text: trimmed }];
  }

  const [, before, dialoguePart] = inlineMatch;
  const segments: ReaderSegment[] = [];

  if (before.trim()) {
    segments.push({ kind: "narrative", text: before.trim() });
  }

  const dialogueText = stripDialogueMark(dialoguePart.trim());
  if (dialogueText) {
    segments.push({ kind: "dialogue", text: dialogueText });
  }

  return segments.length > 0 ? segments : [{ kind: "narrative", text: trimmed }];
}

function splitInlineSegments(text: string): ReaderSegment[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const inlineMessage = trimmed.match(INLINE_MESSAGE);
  if (inlineMessage) {
    const [, before, message, after] = inlineMessage;
    return [
      ...splitInlineSegments(before),
      { kind: "message" as const, text: stripQuotes(message) },
      ...splitInlineSegments(after),
    ].filter((segment): segment is ReaderSegment => Boolean(segment.text));
  }

  const dialogueSegments = splitEmDashDialogue(trimmed);
  if (dialogueSegments.some((segment) => segment.kind === "dialogue")) {
    return dialogueSegments;
  }

  // Citas cortas (“buena onda,”, “quizás.”) se quedan en el párrafo narrativo.
  return [{ kind: "narrative", text: trimmed }];
}

export function parseReaderParagraph(text: string, prevText?: string): ReaderSegment[] {
  const current = text.trim();
  if (!current) {
    return [{ kind: "narrative", text: current }];
  }

  if (SCENE_BREAK.test(normalize(current))) {
    return [{ kind: "scene-break", text: normalize(current) }];
  }

  if (isBlockNote(current, prevText)) {
    return [{ kind: "note", text: stripQuotes(current) }];
  }

  if (isBlockMessage(current, prevText)) {
    return [{ kind: "message", text: stripQuotes(current) }];
  }

  if (FULLY_QUOTED.test(normalize(current))) {
    return [{ kind: "quote", text: stripQuotes(current) }];
  }

  return splitInlineSegments(current);
}

export function getReaderParagraphClassName(kind: ReaderSegmentKind): string {
  switch (kind) {
    case "message":
      return "reader-paragraph-message";
    case "note":
      return "reader-paragraph-note";
    case "dialogue":
      return "reader-paragraph-dialogue";
    case "quote":
      return "reader-paragraph-quote";
    case "scene-break":
      return "reader-paragraph-scene-break";
    default:
      return "reader-paragraph-narrative";
  }
}

export function getPrimarySegmentKind(segments: ReaderSegment[]): ReaderSegmentKind {
  if (segments.length === 1) return segments[0].kind;
  return "narrative";
}

export function hasHighlightedSegments(segments: ReaderSegment[]): boolean {
  return segments.some((segment) => segment.kind !== "narrative");
}
