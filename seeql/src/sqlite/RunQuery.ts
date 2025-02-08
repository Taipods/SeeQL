import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { generateTableHTML } from './DBwebview/view';

/*
TODO: Disscuss How we want to do this process
Update discriptions later!

Right now the functions checks if the user has a file open
Given sql it will querry that statement
Given multiple sql Qurries, it will only run the
first one

Fix -> Gonna Add a button per query, gonna get called
button click
*/
export async function runQuery(db: sqlite3.Database) {
// The following check for an active sql file outdated
  const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active SQL file.');
      return;
    }
// (Button is going to need to store the querry String)
    const sql = editor.document.getText();
// Following Line runs the query using the database and returns error
// given query doens't work
    db.all(sql, [], (err: any, rows: any[]) => {
    if (err) {
        vscode.window.showErrorMessage('Query error: ' + err.message);
    } else {
        const panel = vscode.window.createWebviewPanel(
        'sqliteResults',
        'SQLite Query Results',
        vscode.ViewColumn.One,
        { enableScripts: true } //enables to run scrips in the webview
    );

    // Renders out the html for webview using a function to print out all rows.
    // I need to put this into a seperate file probabls views
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

export async function printDBTableNames(db: sqlite3.Database) {
    const printDB = `SELECT name
                     FROM sqlite_master
                     WHERE type = 'table'
                     AND name
                     NOT LIKE 'sqlite_%'`; // This is to exclude embeded sqlite tables

    db.all(printDB, [], (err: any, names: any[]) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        } else {
            const panel = vscode.window.createWebviewPanel(
            'sqliteResults',
            'SQLite Query Results',
            vscode.ViewColumn.One,
            { enableScripts: true } //enables to run scrips in the webview
            // Really have to becareful since webview ~= iframes
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
                    <h2>DB Names</h2>
                        ${generateTableHTML(names)}
                </body>
            </html>`;
        }
    });
}

