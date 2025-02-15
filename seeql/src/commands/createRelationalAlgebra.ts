import * as vscode from 'vscode';
import { Parser as SqlParser } from 'node-sql-parser';

export async function createRelationalAlgebra() {
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
        const fileContents = await Promise.all(
            fileUris.map(async (uri) => {
                const fileContent = await vscode.workspace.fs.readFile(uri);
                const decodedContent = new TextDecoder("utf-8").decode(fileContent);
                return decodedContent;
            })
        );

        // Panels for showing files
        // File Panel will show the content of SQL files
        const filePanel = vscode.window.createWebviewPanel(
            'fileContent',
            'File Content',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const createRelationalAlgebra = vscode.window.createWebviewPanel(
            'relationalAlgebra',
            'Relational Algebra',
            vscode.ViewColumn.Two,
            { enableScripts: true }
        );

        const ast = new SqlParser().astify(fileContents.join('\n\n'));

        filePanel.webview.html = showTableNames(fileContents);
        createRelationalAlgebra.webview.html = showRelationalAlgebra(ast); // Pass the AST directly


    } else {
        vscode.window.showInformationMessage('No files selected.');
    }
}

function showTableNames(fileContents: string[]): string {
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

function showRelationalAlgebra(ast: any): string {

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
            <h1>Relational Algebra</h1>
            <pre>${convertToRelationalAlgebra(ast)}</pre>
        </body>
        </html>
    `;
}

function convertToRelationalAlgebra(ast: any): string {
    if(ast === null || ast === undefined) {
        return '';
    }
    let mermaidCode = '';
    if (ast.type === 'select') {
        mermaidCode += 'select ';
        if (ast.columns) {
            mermaidCode += ast.columns.map((col: any) => col.expr.column).join(', ');
        }
        if (ast.from) {
            mermaidCode += ' from ' + ast.from[0].table;
        }
        if (ast.where) {
            mermaidCode += ' where ' + ast.where.condition.left.column + ' ' + ast.where.condition.operator + ' ' + ast.where.condition.right.value;
        }
    }

    return mermaidCode;
}