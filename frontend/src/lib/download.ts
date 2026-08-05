/**
 * Client-side "fake download" helpers ported from REHUB WORK V8.html,
 * script block 1, ~lines 187-198. Used by the demo document/report
 * generation flows to trigger a browser download of generated content.
 */

export function downloadBlob(filename: string, content: BlobPart, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function makeDummyContent(title: string, format: string): string {
  if (format === "XLSX") {
    return `RECONSTRUCTION HUB — ${title}\nCol1;Col2;Col3\nA;B;C`;
  }
  return `%PDF-1.4 (demo)\n\nRECONSTRUCTION HUB\n${title}\n\nGenerated for demonstration purposes.`;
}
