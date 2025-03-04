// Need to standarized the css styling

// This Function is used to generate the HTML for the webview
// It takes in the rows of data and returns a string of HTML
// @Param: rows - an array of objects representing the rows of data
// @Return: a string of HTML for the webview
export function queryResWebView(rows: any[]): string {
    const rowCount = rows.length;
    const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
  return `<html>
      <head>
          <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid white; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              tr:nth-child(1) th, tr:nth-child(1) td { border: 1px solid black; }
              tr:nth-child(1) { color: black; } /* Header row */
          </style>
      </head>
          <body>
              <h2>Query Results  Rows: ${rowCount}, Columns: ${columnCount}</h2>
                  ${generateTableHTML(rows)}
          </body>
      </html>`;
}

// This Function is used to generate the HTML for the table
// It takes in the rows of data and returns a string of HTML
// @Param: rows - an array of objects representing the rows of data
// @Return: a string of HTML representing the table
// @exceptions: Throws an error if the rows are empty
export function generateTableHTML(rows: any[]): string {

  if (rows.length === 0) {return '<p>No results found.</p>';}

  const headers = Object.keys(rows[0]);
  const headerRow = headers.map(header => `<th>${header}</th>`).join('');
  const bodyRows = rows.map(row => `<tr>${headers.map(header => `<td>${row[header]}</td>`).join('')}</tr>`).join('');
  return `<table><tr>${headerRow}</tr>${bodyRows}</table>`;
}

// TODO: Fix this ugly code with react if free
// This Function is used to generate the HTML for the showing table names and columns
// @Param: names - an array of objects representing the names of the tables
// @Return: a string of HTML representing the table names and columns
export function tableResWebView(names: any[]): string {

    const tableNamesHTML = names.map(name => `
        <tr>
            <td>${name.name} <button onclick="toggleTableColumns('${name.name}', this)">&#9654;</button></td>
        </tr>
    `).join('');

    return `<html>
                    <head>
                        <style>
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid white; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            tr:nth-child(1) th, tr:nth-child(1) td { border: 1px solid black; }
                            tr:nth-child(1) { color: black; } /* Header row */
                            button { margin-left: 10px; }
                            .columns-table { display: none; margin-left: 20px; }
                            .table-container { display: flex; gap: 20px; } /* Add gap between tables */
                        </style>
                    </head>
                    <body>
                        <h2>Table Names</h2>
                        <div class="table-container">
                            <table>
                                <tr>
                                    <th>Table Name</th>
                                </tr>
                                ${tableNamesHTML}
                            </table>
                            <div id="tableColumns" class="columns-table"></div>
                        </div>
                        <script>
                            const vscode = acquireVsCodeApi();
                            let currentButton = null;
                            function toggleTableColumns(tableName, button) {
                                const tableColumnsDiv = document.getElementById('tableColumns');
                                if (tableColumnsDiv.style.display === 'none' || tableColumnsDiv.getAttribute('data-table') !== tableName) {
                                    vscode.postMessage({ command: 'showTableColumns', tableName });
                                    tableColumnsDiv.setAttribute('data-table', tableName);
                                    tableColumnsDiv.style.display = 'block';
                                    button.innerHTML = '&#9660;'; // Change arrow to downwards
                                    if (currentButton && currentButton !== button) {
                                        currentButton.innerHTML = '&#9654;'; // Change previous button arrow to rightwards
                                    }
                                    currentButton = button;
                                } else {
                                    tableColumnsDiv.style.display = 'none';
                                    button.innerHTML = '&#9654;'; // Change arrow to rightwards
                                    currentButton = null;
                                }
                            }
                            window.addEventListener('message', event => {
                                const message = event.data;
                                if (message.command === 'displayColumns') {
                                    document.getElementById('tableColumns').innerHTML = message.html;
                                }
                            });
                        </script>
                    </body>
                </html>
            `;
}