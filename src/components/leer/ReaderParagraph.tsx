"use client";

import { useMemo } from "react";
import {
  getPrimarySegmentKind,
  getReaderParagraphClassName,
  hasHighlightedSegments,
  parseReaderParagraph,
  type ReaderSegment,
} from "@/lib/reader-format";

interface ReaderParagraphProps {
  text: string;
  prevText?: string;
  fontSize: number;
}

function renderSegment(segment: ReaderSegment, fontSize: number, key: number) {
  const accentSize = Math.max(14, fontSize - 1);

  switch (segment.kind) {
    case "message":
      return (
        <div key={key} className="reader-message-bubble font-sans ml-auto max-w-[92%] sm:max-w-[85%]">
          <span className="reader-message-label">Mensaje de texto</span>
          <p
            className="mt-1 whitespace-pre-wrap text-ink/90"
            style={{ fontSize: `${accentSize}px`, lineHeight: 1.55 }}
          >
            {segment.text}
          </p>
        </div>
      );

    case "note":
      return (
        <div key={key} className="reader-note-bubble font-sans max-w-[92%] sm:max-w-[85%]">
          <span className="reader-note-label">Nota escrita</span>
          <p
            className="mt-1 whitespace-pre-wrap text-ink/90"
            style={{ fontSize: `${accentSize}px`, lineHeight: 1.55 }}
          >
            {segment.text}
          </p>
        </div>
      );

    case "dialogue":
      return (
        <p
          key={key}
          className="reader-dialogue font-sans text-ink/90"
          style={{ fontSize: `${accentSize}px`, lineHeight: 1.65 }}
        >
          {segment.text}
        </p>
      );

    case "quote":
      return (
        <p
          key={key}
          className="reader-quote font-sans text-ink/85"
          style={{ fontSize: `${accentSize}px`, lineHeight: 1.65 }}
        >
          {segment.text}
        </p>
      );

    default:
      return (
        <p
          key={key}
          className="reader-paragraph-narrative font-serif leading-relaxed text-ink/90"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {segment.text}
        </p>
      );
  }
}

export function ReaderParagraph({ text, prevText, fontSize }: ReaderParagraphProps) {
  const segments = useMemo(() => parseReaderParagraph(text, prevText), [text, prevText]);
  const primaryKind = getPrimarySegmentKind(segments);
  const className = getReaderParagraphClassName(primaryKind);
  const highlighted = hasHighlightedSegments(segments);

  if (primaryKind === "scene-break") {
    return (
      <p
        className={`${className} text-center font-serif tracking-[0.35em] text-terracotta/35`}
        style={{ fontSize: `${Math.max(12, fontSize - 2)}px`, lineHeight: 1.4 }}
        aria-hidden
      >
        {segments[0].text}
      </p>
    );
  }

  if (primaryKind === "message" && segments.length === 1) {
    return <div className={`${className} my-2 flex justify-end`}>{renderSegment(segments[0], fontSize, 0)}</div>;
  }

  if (primaryKind === "note" && segments.length === 1) {
    return <div className={`${className} my-2`}>{renderSegment(segments[0], fontSize, 0)}</div>;
  }

  if (primaryKind === "dialogue" && segments.length === 1) {
    return (
      <div className={`${className} my-1 pl-1`}>{renderSegment(segments[0], fontSize, 0)}</div>
    );
  }

  if (primaryKind === "quote" && segments.length === 1) {
    return (
      <div className={`${className} my-2`}>{renderSegment(segments[0], fontSize, 0)}</div>
    );
  }

  if (highlighted) {
    return (
      <div className={`${className} space-y-3`}>
        {segments.map((segment, index) => renderSegment(segment, fontSize, index))}
      </div>
    );
  }

  return (
    <p
      className={`${className} font-serif leading-relaxed text-ink/90`}
      style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
    >
      {segments[0]?.text ?? text}
    </p>
  );
}
