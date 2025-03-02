import * as vscode from 'vscode';
import * as path from 'path';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';

/**
 * Creates the ER Diagram from the selected SQL files
 * @param context: This is used for the css to work
 * @returns: 
 */
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

/**
 * Simple function that returns a simple webview of the file content
 * All that's done is that it's joined together in it's original format
 * @param fileContents: a converted string array of the file contents
 * @returns a string that is used to process the HTML
 */
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

/**
 * Generates the HTML content for the ER Diagram visualization.
 * Through using mermaid.js
 * @param erDiagram: the parsed ER Diagram object
 * @param css: the URI of the CSS file to use for styling the diagram
 * @returns 
 */
function generateERDiagramHTML(erDiagram: ERDiagram, css: string): string {
    const diagram = `
        erDiagram
        ${erDiagram.tables.map(table => `
            ${table.name}{
                ${table.columns.map(col => table.primaryKey.includes(col.name) ? `*${col.name} ${col.type}` : `${col.name} ${col.type}`).join('\n')}
            }
        ${table.foreignKeys.map(fk => {
            // One to One Relationship
            // Small error doesn't account for non unique
            for(let i = 0; i < fk.columns.length; i++) {
                const fkColumn = fk.columns[i];
                const tableColumn = table.columns.find(col => col.name === fkColumn);
                if (tableColumn?.constraints?.includes('UNIQUE')) {
                    return `
                        ${table.name} ${'||--||'} ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
                    `;
                }
            }
            // Many to Many Relationship
            if (table.foreignKeys.length > 1) {
                return `
                    ${table.name} ${'|o--o{'} ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
                `;
            }
            // Many to One Relationship
            return `
                ${table.name} ${'||--o|'} ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
            `;
        }).join('\n')}
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
             <style>
                .primaryKey rect {
                    fill: #ffcccc; /* Change this to your desired background color */
                }
            </style>
        </head>
        <body>
            <div class="legend">
                <h1>SeeQl: ER Diagram</h1>
                <h2>Legend</h2>
                <table border="1">
                    <tr>
                        <th>Symbol</th>
                        <th>Meaning</th>
                    </tr>
                    <tr>
                        <td><strong>*</strong></td>
                        <td>Primary Key</td>
                    </tr>
                    <tr>
                        <td><strong>|o---------------||</strong></td>
                        <td>Many-to-One Relationship (o is reference start)</td>
                    </tr>
                    <tr>
                        <td><strong>|---------------||</strong></td>
                        <td>One-to-One Relationship (o is reference start)</td>
                    </tr>
                    <tr>
                        <td><strong>|o---------------o|</strong></td>
                        <td>Many-to-Many Relationship (o is reference start)</td>
                    </tr>
                </table>
            </div>
            <div class="mermaid">
                ${diagram}
            </div>
        </body>
        </html>
    `;
}