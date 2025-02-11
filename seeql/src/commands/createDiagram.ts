import * as vscode from 'vscode';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';
import * as path from 'path';

export async function createDiagram(context: vscode.ExtensionContext) {
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
        const filePanel = vscode.window.createWebviewPanel(
            'fileContent',
            'File Content',
            vscode.ViewColumn.One,
            {enableScripts: true}
        );

        const visualizerPanel = vscode.window.createWebviewPanel(
            'visualizer',
            'ER Diagram',
            vscode.ViewColumn.Two,
            {enableScripts: true}
        );

        const fileContents = await Promise.all(
            fileUris.map(async (uri) => {
                const fileContent = await vscode.workspace.fs.readFile(uri);
                return `File: ${uri.fsPath}\n\n${fileContent.toString()}`;
            })
        );

        const erDiagram = parseSQLForERDiagram(fileContents.join('\n\n'));
        if('error' in erDiagram) {
            vscode.window.showErrorMessage(erDiagram.error);
            return;
        }

        const diagramStylePath = vscode.Uri.file(
            path.join(context.extensionPath, 'media', 'diagramStyle.css')
        )
        const diagramStyleSrc = visualizerPanel.webview.asWebviewUri(diagramStylePath);

        filePanel.webview.html = showTableNames(fileContents);
        visualizerPanel.webview.html = generateERDiagramHTML(erDiagram, visualizerPanel.webview, diagramStyleSrc);
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

function generateERDiagramHTML(erDiagram: ERDiagram, webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const css = webview.asWebviewUri(extensionUri);
    const tableHtml = erDiagram.tables.map(table => `
        <div class="table">
            <h2>${table.name}</h2>
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
            <p><strong>Foreign Keys:</strong> ${table.foreignKeys.map(fk =>
                `(${fk.columns.join(', ')}) → ${fk.referencesTable}(${fk.referencesColumns.join(', ')})`
            ).join('<br>') || 'None'}</p>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ER Diagram</title>
            <link rel="stylesheet" type="text/css" href="${css}">
        </head>
        <body>
            <h1>ER Diagram</h1>
            <div class="container">
                ${tableHtml}
            </div>
        </body>
        </html>
    `;
}