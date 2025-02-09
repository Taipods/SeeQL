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
const path = __importStar(require("path"));
const sqlParser_1 = require("../parser/sqlParser");
async function createDiagram(context) {
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
        const filePanel = vscode.window.createWebviewPanel('fileContent', 'File Content', vscode.ViewColumn.One, { enableScripts: true });
        const visualizerPanel = vscode.window.createWebviewPanel('visualizer', 'ER Diagram', vscode.ViewColumn.Two, { enableScripts: true });
        const diagramStylePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'diagramStyle.css'));
        const diagramStyleSrc = filePanel.webview.asWebviewUri(diagramStylePath);
        filePanel.webview.html = showTableNames(fileContents);
        visualizerPanel.webview.html = generateERDiagramHTML(erDiagram, diagramStyleSrc.toString());
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
function generateERDiagramHTML(erDiagram, css) {
    const diagram = `
        erDiagram
        ${erDiagram.tables.map(table => `
            ${table.name} {
                ${table.columns.map(col => `${col.name} ${col.type}`).join('\n')}
            }
            ${table.foreignKeys.map(fk => `
                ${table.name} ||--o| ${fk.referencesTable} : "FK"
            `).join('\n')}
        `).join('\n')}
    `;
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ER Diagram</title>
            <style>
                /* Custom CSS to style Mermaid diagrams */
                .mermaid .node rect {
                    fill: #f9f9f9;
                    stroke: #333;
                }
                .mermaid .edgeLabel {
                    font-size: 12px;
                    fill: #333;
                }
            </style>
            <script type="module">
                import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
                mermaid.initialize({ startOnLoad: true });
            </script>
        </head>
        <body>
            <h1>SeeQl: ER Diagram</h1>
            <div class="mermaid">
                ${diagram}
            </div>
        </body>
        </html>
    `;
}
//# sourceMappingURL=createDiagram.js.map