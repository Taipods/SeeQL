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
exports.createRelationalAlgebra = createRelationalAlgebra;
const vscode = __importStar(require("vscode"));
const node_sql_parser_1 = require("node-sql-parser");
async function createRelationalAlgebra() {
    // Pulls file directory
    const fileUris = await vscode.window.showOpenDialog({
        canSelectMany: true,
        openLabel: 'Select SQL Files',
        filters: {
            'SQL Files': ['sql']
        }
    });
    if (fileUris && fileUris.length > 0) {
        vscode.window.showInformationMessage(`Selected files: ${fileUris.map(uri => uri.fsPath).join(', ')}`);
        const fileContents = await Promise.all(fileUris.map(async (uri) => {
            const fileContent = await vscode.workspace.fs.readFile(uri);
            const decodedContent = new TextDecoder("utf-8").decode(fileContent);
            return decodedContent;
        }));
        // Panels for showing files
        // File Panel will show the content of SQL files
        const filePanel = vscode.window.createWebviewPanel('fileContent', 'File Content', vscode.ViewColumn.One, { enableScripts: true });
        const createRelationalAlgebra = vscode.window.createWebviewPanel('relationalAlgebra', 'Relational Algebra', vscode.ViewColumn.Two, { enableScripts: true });
        const ast = new node_sql_parser_1.Parser().astify(fileContents.join('\n\n'));
        filePanel.webview.html = showTableNames(fileContents);
        createRelationalAlgebra.webview.html = showRelationalAlgebra(ast); // Pass the AST directly
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
function showRelationalAlgebra(ast) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relational Algebra</title>
            <script type="module">
                import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
                mermaid.initialize({ startOnLoad: true });
            </script>
        </head>
        <body>
            <h1>SeeQL: Relational Algebra</h1>
            <div class="mermaid">
                ${convertToRelationalAlgebra(ast)}
            </div>
        </body>
        </html>
    `;
}
function convertToRelationalAlgebra(ast) {
    const relationalAlgebra = convertAstToTables(ast);
    const diagram = `
        erDiagram
            "π: *" ||--o{ "σ: City = New York" : places
            "σ: City = New York" ||--|{ "σ: City = Seattle" : contains
    `;
    return diagram;
}
function convertAstToTables(ast) {
    if (!ast)
        return "";
    let word = "";
    ast.forEach((query) => {
        if (query.columns && Array.isArray(query.columns)) {
            query.columns.forEach((col) => {
                if (col.expr && col.expr.column) {
                    word += col.expr.column + " ";
                }
            });
        }
    });
    return word.toLocaleUpperCase();
}
//# sourceMappingURL=createRelationalAlgebra.js.map