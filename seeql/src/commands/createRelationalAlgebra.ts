import * as vscode from 'vscode';
import {Parser as SqlParser} from 'node-sql-parser';

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
                {enableScripts: true}
        );


        const sql = "SELECT name FROM students WHERE age > 18";
        const ast = new SqlParser().astify(fileContents.join('\n\n'));
        console.log(JSON.stringify(ast, null, 2));
        vscode.window.showInformationMessage(`Parsed AST: ${JSON.stringify(ast, null, 2)}`);
        
        filePanel.webview.html = showTableNames(fileContents);

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