import * as vscode from 'vscode';
import * as path from 'path';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';

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
        // Reads the content of the selected files
        const fileContents = await Promise.all(
            fileUris.map(async (uri) => {
                const fileContent = await vscode.workspace.fs.readFile(uri);
                return `File: ${uri.fsPath}\n\n${fileContent.toString()}`;
            })
        );

        // Parse SQL files for ER Diagram key words for the diagram
        const erDiagram = parseSQLForERDiagram(fileContents.join('\n\n'));
        if('error' in erDiagram) {
            vscode.window.showErrorMessage(erDiagram.error);
            return;
        }

        // Panels for showing files
        // File Panel will show the content of SQL files
        const filePanel = vscode.window.createWebviewPanel(
            'fileContent',
            'File Content',
            vscode.ViewColumn.One,
            {enableScripts: true}
        );

        // ErDiagram File will show the ER Diagram of the SQL files
        const visualizerPanel = vscode.window.createWebviewPanel(
            'visualizer',
            'ER Diagram',
            vscode.ViewColumn.Two,
            {enableScripts: true}
        );

        const diagramStylePath = vscode.Uri.file(path.join(context.extensionPath, 'media', 'diagramStyle.css'));
        const diagramStyleSrc = filePanel.webview.asWebviewUri(diagramStylePath);

        filePanel.webview.html = showTableNames(fileContents);
        visualizerPanel.webview.html = generateERDiagramHTML(erDiagram, diagramStyleSrc.toString());
    } else {
        vscode.window.showInformationMessage('No files selected.');
    }
}

// Simple function that returns a simple webview of the file content
// All that's done is that it's joined together in it's original format
// Parameters:
// fileContents: a converted string array of the file contents
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

// Generates the HTML content for the ER Diagram visualization.
// Through using mermaid.js
// Parameters:
// - erDiagram: the parsed ER Diagram object
// - css: the URI of the CSS file to use for styling the diagram
function generateERDiagramHTML(erDiagram: ERDiagram, css: string): string {
    const diagram = `
        erDiagram
        ${erDiagram.tables.map(table => `
            ${table.name} {
                ${table.columns.map(col => `${col.name} ${col.type}`).join('\n')}
            }
            ${table.foreignKeys.map(fk => `
                ${table.name} ||--o| ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
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
            <link rel="stylesheet" href="${css}">
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