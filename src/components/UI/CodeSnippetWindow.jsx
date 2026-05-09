function normalizeCode(raw = "") {
  return raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function getSafeHighlightRange(range, lineCount) {
  if (!range || typeof range.start !== "number" || typeof range.end !== "number") return null;

  if (range.start > lineCount) return null;

  const start = Math.max(1, range.start);
  const end = Math.max(start, Math.min(lineCount, range.end));

  return { start, end };
}

export default function CodeSnippetWindow({
  code = "",
  highlightedHtml = "",
  emptyText = "No snippet yet.",
  className = "",
  maxHeight = 320,
  highlightRange = null,
}) {
  const normalizedCode = normalizeCode(code);
  const hasCode = normalizedCode.trim().length > 0;
  const lines = normalizedCode === "" ? [""] : normalizedCode.split("\n");
  const lineCount = Math.max(lines.length, 1);
  const safeRange = getSafeHighlightRange(highlightRange, lineCount);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);
  const maxHeightValue = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  return (
    <div className={`snippet-editor snippet-window ${className}`.trim()}>
      <div className="snippet-window__chrome">
        <span className="snippet-window__dot snippet-window__dot--red" />
        <span className="snippet-window__dot snippet-window__dot--yellow" />
        <span className="snippet-window__dot snippet-window__dot--green" />
      </div>

      <div className="snippet-window__scroll" style={{ maxHeight: maxHeightValue }}>
        {safeRange && (
          <>
            <div
              aria-hidden="true"
              className="snippet-window__range"
              style={{
                top: `calc((var(--snippet-line-height) * ${safeRange.start - 1}) + var(--snippet-content-padding))`,
                height: `calc(var(--snippet-line-height) * ${safeRange.end - safeRange.start + 1})`,
              }}
            />
            <div
              aria-hidden="true"
              className="snippet-window__active-line"
              style={{ top: `calc((var(--snippet-line-height) * ${safeRange.start - 1}) + var(--snippet-content-padding))` }}
            />
          </>
        )}

        <div className="snippet-window__content">
          <ol className="snippet-window__lines" aria-hidden="true">
            {lineNumbers.map((lineNumber) => {
              const isInRange = safeRange && lineNumber >= safeRange.start && lineNumber <= safeRange.end;
              const isActiveLine = safeRange && lineNumber === safeRange.start;

              return (
                <li
                  key={lineNumber}
                  className={`${isInRange ? "is-highlighted" : ""} ${isActiveLine ? "is-active" : ""}`.trim()}
                >
                  {lineNumber}
                </li>
              );
            })}
          </ol>

          <pre className="snippet-window__pre">
            {hasCode ? (
              highlightedHtml ? (
                <code className="hljs" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              ) : (
                <code>{normalizedCode}</code>
              )
            ) : (
              <code className="snippet-window__empty">{emptyText}</code>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
