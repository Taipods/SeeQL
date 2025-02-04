
export function generateTableHTML(rows: any[]): string {
  if (rows.length === 0) return '<p>No results found.</p>';
  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(header => `<th>${header}</th>`).join('');
  const bodyRows = rows.map(row => `<tr>${headers.map(header => `<td>${row[header]}</td>`).join('')}</tr>`).join('');
  return `<table><tr>${headerRow}</tr>${bodyRows}</table>`;
}