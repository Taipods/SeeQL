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
exports.createDiagram = createDiagram;
const vscode = __importStar(require("vscode"));
const sqlParser_1 = require("../parser/sqlParser");
async function createDiagram() {
    // Pulls file directory
    const fileUris = await vscode.window.showOpenDialog({
        canSelectMany: true,
        openLabel: 'Select SQL Files',
        filters: {
            'SQL Files': ['sql']
        }
    });
    if (fileUris && fileUris.length > 0) {
        // Do something with the selected files
        vscode.window.showInformationMessage(`Selected files: ${fileUris.map(uri => uri.fsPath).join(', ')}`);
        // You can now process the selected files (e.g., read their content, create diagrams, etc.)
        // Panels for showing files
        const fileContents = await Promise.all(fileUris.map(async (uri) => {
            const fileContent = await vscode.workspace.fs.readFile(uri);
            return `File: ${uri.fsPath}\n\n${fileContent.toString()}`;
        }));
        const erDiagram = (0, sqlParser_1.parseSQLForERDiagram)(fileContents.join('\n\n'));
        if ('error' in erDiagram) {
            vscode.window.showErrorMessage(erDiagram.error);
            return;
        }
        const filePanel = vscode.window.createWebviewPanel('fileContent', 'File Content', vscode.ViewColumn.One, {});
        const visualizerPanel = vscode.window.createWebviewPanel('visualizer', 'ER Diagram', vscode.ViewColumn.Two, {});
        filePanel.webview.html = showTableNames(fileContents);
        visualizerPanel.webview.html = generateERDiagramHTML(erDiagram);
    }
    else {
        vscode.window.showInformationMessage('No files selected.');
    }
}
function showTableNames(fileContents) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>File Content</title>
        </head>
        <body>
            <h1>Selected File Contents</h1>
            <pre>${fileContents.join('\n\n')}</pre>
        </body>
        </html>
    `;
}
function generateERDiagramHTML(erDiagram) {
    const tableHtml = erDiagram.tables.map(table => `
        <div class="table">
            <h2>${table.name.toUpperCase()}</h2>
            <table>
                <thead>
                    <tr><th>Column Name</th><th>Type</th><th>Constraints</th></tr>
                </thead>
                <tbody>
                    ${table.columns.map(col => `
                        <tr>
                            <td>${col.name}</td>
                            <td>${col.type}</td>
                            <td>${col.constraints?.join(', ') || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p><strong>Primary Key:</strong> ${table.primaryKey.join(', ') || 'None'}</p>
            <p><strong>Foreign Keys:</strong> ${table.foreignKeys.length ? table.foreignKeys.map(fk => `(${fk.columns.join(', ')}) → ${fk.referencesTable}(${fk.referencesColumns.join(', ')})`).join('<br>') : 'None'}</p>
        </div>
    `).join('');
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ER Diagram</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background-color: #1e1e1e; 
                    color: #fff; 
                    padding: 20px; 
                }
                h1 {
                    text-align: center;
                    font-size: 24px;
                }
                .table { 
                    background-color: #2a2a2a; 
                    border: 1px solid #444; 
                    padding: 15px; 
                    margin-bottom: 20px; 
                    border-radius: 8px;
                }
                h2 { 
                    background-color: #555; 
                    color: #ddd; 
                    padding: 8px; 
                    text-transform: uppercase; 
                    font-weight: bold;
                    border-radius: 5px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 10px; 
                }
                th, td { 
                    border: 1px solid #555; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background-color: #444; 
                }
            </style>
        </head>
        <body>
            <h1>ER Diagram</h1>
            ${tableHtml}
        </body>
        </html>
    `;
}
//# sourceMappingURL=createDiagram.js.map