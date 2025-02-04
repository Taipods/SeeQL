import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { generateTableHTML } from './DBwebview/view';

/*
TODO: Disscuss How we want to do this process
Update discriptions later!

Right now the functions checks if the user has a file open
Given sql it will querry that statement (Haven't tested
What if there are multiple sql statement)
*/
export async function runQuery(db: sqlite3.Database) {

  const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active SQL file.');
      return;
    }
    const sql = editor.document.getText();
    db.all(sql, [], (err: any, rows: any[]) => {
    if (err) {
        vscode.window.showErrorMessage('Query error: ' + err.message);
    } else {
        const panel = vscode.window.createWebviewPanel(
        'sqliteResults',
        'SQLite Query Results',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

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
          });
        }