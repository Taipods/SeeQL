import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { generateTableHTML } from './DBwebview/view';

/*
Called when a button is pressed in a SQL File. takes the file and the database currently open
and runs the query, error if invalid in any way, displays the results in a table with row/col count
*/
/*
export async function runQuery(db: sqlite3.Database, query: string) {
// The following check for an active sql file outdated
db.all(query, [], (err: any, rows: any[]) => {
    if (err) {
        vscode.window.showErrorMessage('Query error: ' + err.message);
    } else {
        const rowCount = rows.length;
        const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
        const panel = vscode.window.createWebviewPanel(
            'sqliteResults',
            'SQLite Query Results',
            vscode.ViewColumn.One,
            { enableScripts: true } //enables to run scrips in the webview
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
                        <div class="stats">
                            Rows: ${rowCount}, Columns: ${columnCount}
                        </div>

                </body>
            </html>`;

    }
});

}

//will fix this later, same implementation as runquery but returns result instead of displaying for test
export async function runQueryTest(db: sqlite3.Database, query: string): Promise<{ rows: any[]; rowCount: number; columnCount: number }> {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err: any, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                const rowCount = rows.length;
                const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
                resolve({ rows, rowCount, columnCount });
            }
        });
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
                    <h2>DB Tables Names</h2>
                        ${generateTableHTML(names)}
                </body>
            </html>`;
        }
    });
}
*/

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
        const rowCount = rows.length; //rows
        const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0; //cols

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
                        <div class="stats">
                            Rows: ${rowCount}, Columns: ${columnCount}
                        </div>

                </body>
            </html>`;
        }
    });
}

export async function runQueryTest(db: sqlite3.Database, query: string): Promise<{ rows: any[]; rowCount: number; columnCount: number }> {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err: any, rows: any[]) => {
            if (err) {
                reject(err);
            } else {
                const rowCount = rows.length;
                const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
                resolve({ rows, rowCount, columnCount });
            }
        });
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
                    <h2>DB Tables Names</h2>
                        ${generateTableHTML(names)}
                </body>
            </html>`;
        }
    });
}

