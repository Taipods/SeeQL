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
const vscode = __importStar(require("vscode"));
const view_1 = require("./DBwebview/view");
/*
TODO: Disscuss How we want to do this process
Update discriptions later!

Right now the functions checks if the user has a file open
Given sql it will querry that statement (Haven't tested
What if there are multiple sql statement)
*/
async function runQuery(db) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active SQL file.');
        return;
    }
    const sql = editor.document.getText();
    db.all(sql, [], (err, rows) => {
        if (err) {
            vscode.window.showErrorMessage('Query error: ' + err.message);
        }
        else {
            const panel = vscode.window.createWebviewPanel('sqliteResults', 'SQLite Query Results', vscode.ViewColumn.One, { enableScripts: true });
            panel.webview.html = `
                      <html>
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
                      </body>
                      </html>
                  `;
        }
    });
}
//# sourceMappingURL=RunQuerry.js.map