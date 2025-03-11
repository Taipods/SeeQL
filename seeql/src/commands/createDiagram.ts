import * as vscode from 'vscode';
import * as path from 'path';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';

/**
 * Creates the ER Diagram from the selected SQL files
 * @param context: This is used for the css to work
 * @returns: 
 */
export async function createDiagram(context: vscode.ExtensionContext) {
    // Use VS Code's built-in quick pick to select SQL files
    const files = await vscode.workspace.findFiles('**/*.sql', '**/node_modules/**');
    if (!files.length) {
        vscode.window.showInformationMessage('No SQL files found in workspace.');
        return;
    }

    const fileUris = await vscode.window.showQuickPick(
        files.map(file => ({
            label: `$(database) ${path.basename(file.fsPath)}`, // Adds a file icon
            description: file.fsPath, 
            uri: file
        })),
        {
            canPickMany: false,
            placeHolder: 'Select SQL Files for visualization'
        }
    );

    if (!fileUris) {
        vscode.window.showInformationMessage('No files selected.');
        return;
    }

    vscode.window.showInformationMessage(`Selected file: ${fileUris.description}`);

    // Read the content of the selected files
    const fileContent = await vscode.workspace.fs.readFile(fileUris.uri);
    const fileContents = [`File: ${fileUris.description}\n\n${fileContent.toString()}`];

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
            // We make a for loop, because we need to find out whether a unique is in there or not.
            // If it's not in there we have to find out whether the primary key is in there in both the
            // table and the referenced table as well.
            for(let i = 0; i < fk.columns.length; i++) {
                const fkColumn = fk.columns[i];
                const tableColumn = table.columns.find(col => col.name === fkColumn);
                const referencedTable = erDiagram.tables.find(t => t.name === fk.referencesTable);
                const referencedColumn = referencedTable?.columns.find(col => col.name === fk.referencesColumns[i]);
                if (tableColumn?.constraints?.includes('UNIQUE') ||  (table.primaryKey.length === 1 && table.primaryKey.includes(fkColumn) && referencedTable?.primaryKey.includes(fk.referencesColumns[i]))) {
                    return `
                        ${table.name} ${'||--||'} ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
                    `;
                }
            }
            // Many to Many Relationship
            // This one was weird, but initially I thought it was based off of having multiple primary keys
            // Elio actually picked this up, foreign keys determine the many to many relationship
            // We just need to identify this.
            if (table.primaryKey.length > 1 && table.primaryKey.every(pk => table.foreignKeys.some(fk => fk.columns.includes(pk)))) {
                return `
                    ${table.name} ${'|o--o{'} ${fk.referencesTable} : "FK References: ${fk.referencesColumns.join(', ')}"
                `;
            }
            // Many to One Relationship
            // If it doesn't ever hit the one to one then we or have a foreign key length of higher than 1.
            // We can assume it's a many to one relationship
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