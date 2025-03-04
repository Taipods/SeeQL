import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { generateTableHTML } from './DBwebview/view';

/*
Called when a button is pressed in a SQL File. takes the file and the database currently open
and runs the query, error if invalid in any way, displays the results in a table with row/col count
*/


export async function runQuery(db: sqlite3.Database, query: string) {
    if (!query || query.trim() === "") {
        console.log(query);
        vscode.window.showErrorMessage('Query is empty or undefined.');
        return;
    }

    console.log("Executing query:", query); // Log the query being executed

    db.all(query, [], (err: any, rows: any[]) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
            console.error('Query error:', err); // Log the error to the console
        } else {
            console.log("Query executed successfully:", rows); // Log the query results
            const rowCount = rows.length;
            const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
            const panel = vscode.window.createWebviewPanel(
                'sqliteResults',
                'SQLite Query Results',
                vscode.ViewColumn.One,
                { enableScripts: true } // enables to run scripts in the webview
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

//prints table names and columns
export async function printDBTableNames(db: sqlite3.Database) {
    const printDB = `SELECT name
                     FROM sqlite_master
                     WHERE type = 'table'
                     AND name
                     NOT LIKE 'sqlite_%'`; // This is to exclude embeded sqlite tables

    db.all(printDB, [], async (err: any, names: any[]) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        } else {
            //fetch column names for each table
            const tablesWithColumns = await Promise.all(
                names.map(async (table) => {
                    const columns = await getTableColumns(db, table.name);//get the column names yes
                    return { ...table, columns };
                })
            );

            //create the webview panel
            const panel = vscode.window.createWebviewPanel(
            'sqliteResults',
            'SQLite Query Results',
            vscode.ViewColumn.One,
            { enableScripts: true } //enables to run scrips in the webview
            // Really have to becareful since webview ~= iframes
            );

            //generates tables webview
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
                    <h2>Table and Column Names</h2>
                        ${generateTableWithColumnsHTML(tablesWithColumns)}
                </body>
            </html>`;
        }
    });
}

// Helper function to fetch column names for a table
async function getTableColumns(db: sqlite3.Database, tableName: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const query = `PRAGMA table_info(${tableName})`; //one row per column
        db.all(query, [], (err: any, rows: any[]) => { //for all rows in the table
            if (err) {
                reject(err);
            } else {
                const columns = rows.map((row) => row.name); //for each then just get the name from the query
                resolve(columns);
            }
        });
    });
}

//similar to view.ts but also its a list bcs . idk it looks better
function generateTableWithColumnsHTML(tables: any[]): string {
    if (tables.length === 0) {
        return '<p>No tables found.</p>';
    }

    return tables
        .map((table) => {
            const columnsHTML = table.columns
                .map((column: string) => `<li>${column}</li>`)
                .join('');
            return `
                <div>
                    <h3>Table: ${table.name}</h3>
                    <ul>${columnsHTML}</ul>
                </div>
            `;
        })
        .join('');
}