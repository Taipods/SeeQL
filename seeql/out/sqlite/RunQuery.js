"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runQuery = runQuery;
exports.runQueryTest = runQueryTest;
exports.printDBTableNames = printDBTableNames;
const vscode = __importStar(require("vscode"));
const view_1 = require("./DBwebview/view");
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
async function runQuery(db) {
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
    db.all(sql, [], (err, rows) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        }
        else {
            const rowCount = rows.length; //rows
            const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0; //cols
            const panel = vscode.window.createWebviewPanel('sqliteResults', 'SQLite Query Results', vscode.ViewColumn.One, { enableScripts: true } //enables to run scrips in the webview
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
                        ${(0, view_1.generateTableHTML)(rows)}
                        <div class="stats">
                            Rows: ${rowCount}, Columns: ${columnCount}
                        </div>

                </body>
            </html>`;
        }
    });
}
async function runQueryTest(db, query) {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                const rowCount = rows.length;
                const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
                resolve({ rows, rowCount, columnCount });
            }
        });
    });
}
async function printDBTableNames(db) {
    const printDB = `SELECT name
                     FROM sqlite_master
                     WHERE type = 'table'
                     AND name
                     NOT LIKE 'sqlite_%'`; // This is to exclude embeded sqlite tables
    db.all(printDB, [], (err, names) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        }
        else {
            const panel = vscode.window.createWebviewPanel('sqliteResults', 'SQLite Query Results', vscode.ViewColumn.One, { enableScripts: true } //enables to run scrips in the webview
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
                        ${(0, view_1.generateTableHTML)(names)}
                </body>
            </html>`;
        }
    });
}
//# sourceMappingURL=RunQuery.js.map