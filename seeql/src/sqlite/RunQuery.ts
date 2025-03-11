import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { queryResWebView, tableResWebView } from './DBwebview/view';

export let dbStructure: string = "";

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
            panel.webview.html = queryResWebView(rows);
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

// This function is used to print out the table names of the database and put it in a webview
// It is called when the user opens a database
// @Param: db - the database object
// @Return: void
// @exceptions: Throws an error if the query fails
export async function printDBTableNames(db: sqlite3.Database) {
    const printDB = `SELECT name
                     FROM sqlite_master
                     WHERE type = 'table'
                     AND name
                     NOT LIKE 'sqlite_%'`; // This is to exclude embedded sqlite tables

    db.all(printDB, [], async (err: any, names: any[]) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'sqliteResults',
                'SQLite Query Results',
                vscode.ViewColumn.One,
                { enableScripts: true } // enables to run scripts in the webview
            );

            panel.webview.html = tableResWebView(names);
            // For the AI to understand the database structure,
            // we need to print out the structure of the database
            dbStructure = await getDBStructure(db, names);
            // console.log(dbStructure); // Log the database structure

            panel.webview.onDidReceiveMessage(async message => {
                if (message.command === 'showTableColumns') {
                    const columns = await printTableColumns(db, message.tableName);
                    let columnsHTML;
                    if (!columns || columns.length === 0) {
                        columnsHTML = '<tr><td>No columns found.</td></tr>';
                    } else {
                        columnsHTML = columns.map(column => `<tr><td>${column.name} (${column.type})</td></tr>`).join('');
                    }
                    panel.webview.postMessage({ command: 'displayColumns', html: `<table><tr><th>Column Name (Type)</th></tr>${columnsHTML}</table>` });
                }
            });
        }
    });
}

// This is a helper function to print out the columns of a table
function printTableColumns(db: sqlite3.Database, name: string): Promise<{ name: string, type: string }[]> {
    return new Promise((resolve, reject) => {
        const sqlStatement = `PRAGMA table_info(${name})`; // Prints out the columns of the table
        db.all(sqlStatement, [], (err: any, columns: any[]) => {
            if (err) {
                vscode.window.showErrorMessage('Query error: ' + err.message);
                reject(err);
            } else {
                resolve(columns);
            }
        });
    });
}

// This function is used to print out the structure of the database for the AI
// @param: db - the database object
// @return: a string representing the structure of the database
async function getDBStructure(db: sqlite3.Database, tables: { name: string }[]): Promise<string> {
    let dbStructure = "DB {";

    for (const table of tables) {
        const columns = await printTableColumns(db, table.name);
        dbStructure += `\n  Table ${table.name} {`;
        for (const column of columns) {
            dbStructure += `\n    ${column.name} (${column.type})`;
        }
        dbStructure += `\n  }`;
    }

    dbStructure += `\n}`;

    return dbStructure;
}