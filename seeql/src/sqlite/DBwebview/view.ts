import * as vscode from 'vscode';
/*
export function queryResWebView() {
  panel.webview.html =
  `<html>
      <head>
          <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid black; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
          </style>
      </head>
          <body>
              <h2>Query Results</h2>
                  ${generateTableHTML(rows)}
          </body>
      </html>`;
}
*/

export function generateTableHTML(rows: any[]): string {

  if (rows.length === 0) {return '<p>No results found.</p>'};

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(header => `<th>${header}</th>`).join('');
  const bodyRows = rows.map(row => `<tr>${headers.map(header => `<td>${row[header]}</td>`).join('')}</tr>`).join('');
  return `<table><tr>${headerRow}</tr>${bodyRows}</table>`;
}