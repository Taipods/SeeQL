import * as vscode from 'vscode';

export async function createDiagram() {
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
        const panel = vscode.window.createWebviewPanel(
            'fileContent',
            'File Content',
            vscode.ViewColumn.One,
            {}
        );
        const fileContents = await Promise.all(
            fileUris.map(async (uri) => {
                const fileContent = await vscode.workspace.fs.readFile(uri);
                return `File: ${uri.fsPath}\n\n${fileContent.toString()}`;
            })
        );
        panel.webview.html = showTableNames(fileContents);
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