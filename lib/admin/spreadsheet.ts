/**
 * Spreadsheet helpers shared by exports (and, in Phase 3, imports).
 */

/**
 * Neutralises spreadsheet formula injection (CWE-1236). A text cell starting
 * with = + - @ (or a tab / carriage return) is executed as a formula by Excel
 * and Google Sheets, so it is prefixed with an apostrophe, which spreadsheet
 * apps treat as "this is text". Importers strip that apostrophe again.
 */
export function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** Reverses neutralizeFormula for re-imported files. */
export function restoreFormulaText(value: string): string {
  return /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value;
}

export function toCsv(rows: Array<Array<string | number | null>>): string {
  const escape = (cell: string | number | null) => {
    if (cell === null || cell === undefined) return "";
    const text = typeof cell === "number" ? String(cell) : neutralizeFormula(cell);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // BOM so Excel opens UTF-8 (₹, accented names) correctly.
  return "﻿" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
}
