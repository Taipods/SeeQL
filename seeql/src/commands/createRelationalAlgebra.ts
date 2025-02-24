import * as vscode from 'vscode';
import { Parser as SqlParser } from 'node-sql-parser';

// Not needed
export interface Table {
    name: string;
}

// Not needed old approach
export interface conditions {
    left: string;
    right: string;
    condition: string;
}

/**
 * This function is used to create a relational algebra from a SQL file.
 */
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

/**
 * Shows the content of the selected files in a WebView.
 * @param fileContents 
 * @returns a string that can be used as the HTML
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
 * Shows the relational algebra of the selected files in a WebView.
 * @param ast: Contains the AST's of the queries from the sql parser
 * @returns: the HTML needed for the WebView
 */
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
            <div class="legend">
                <h1>SeeQL: Relational Algebra</h1>
                <h2>Legend</h2>
                <table border="1">
                    <tr>
                        <th>Symbol</th>
                        <th>Meaning</th>
                    </tr>
                    <tr>
                        <td><strong>σ</strong></td>
                        <td>Selection</td>
                    </tr>
                    <tr>
                        <td><strong>π</strong></td>
                        <td>Projection</td>
                    </tr>
                    <tr>
                        <td><strong>⋈</strong></td>
                        <td>Natural Join</td>
                    </tr>
                </table>
            </div>
            <div class="mermaid">
                ${convertToRelationalAlgebra(ast)}
            </div>
        </body>
        </html>
    `;
}

/**
 * This converts and ast to mermaid string flowcharts representing the RA plans.
 * But it only handles Select, WHERE, and JOIN clauses for now.
 * Also, if more than 2 tables for a join, the diagram isn't exactly equivalent 
 * to an RA plan as of now (all the tables will "point" to the same JOIN node).
 * 
 * @param ast Contains the AST's of the queries
 * @returns A String in mermaid interpretable format that represents the RA plans
 */
export function convertToRelationalAlgebra(ast: any): string {
    if (!ast) {
        return '%% No valid AST found';
    }
    // Ensure the AST is an array (even if only one query is present).
    if (!Array.isArray(ast)) {
        ast = [ast];
    }
    let diagramParts: string[] = [];
    let queryCount = 0;

    for (const query of ast) {
        queryCount++;
        if (query.type !== 'select') {
            diagramParts.push(`%% Query ${queryCount} is not a SELECT query. Unsupported.`);
            continue;
        }

        // Start the Mermaid flowchart.
        let diagram = `flowchart BT\n`;
        let nodeId = 0;
        function nextId() {
            return `node${nodeId++}`;
        }
        let nodes: string[] = [];
        let edges: string[] = [];

        // Process the FROM clause.
        let fromNode: string;
        if (query.from && Array.isArray(query.from)) {
            if (query.from.length === 1) {
                fromNode = nextId();
                nodes.push(`${fromNode}[${query.from[0].table}]`);
            } else if (query.from.length > 1) {
                // If multiple tables, assume they are joined.
                let joinNodes: string[] = [];
                query.from.forEach((tbl: { table: any; }) => {
                    let tNode = nextId();
                    nodes.push(`${tNode}[${tbl.table}]`);
                    joinNodes.push(tNode);
                });
                fromNode = nextId();
                nodes.push(`${fromNode}((JOIN ⋈))`);
                joinNodes.forEach(tNode => {
                    edges.push(`${tNode} --> ${fromNode}`);
                });
            } else {
                fromNode = nextId();
                nodes.push(`${fromNode}[Unknown Table]`);
            }
        } else {
            fromNode = nextId();
            nodes.push(`${fromNode}[No FROM clause]`);
        }
        let currentNode = fromNode;

        // Process any explicit JOINs (not sure node-sql-parser has this field).
        if (query.join && Array.isArray(query.join)) {
            query.join.forEach((j: { table: any; on: any; }) => {
                let joinTable = j.table;
                let joinTableNode = nextId();
                nodes.push(`${joinTableNode}[${joinTable}]`);
                let joinOpNode = nextId();
                nodes.push(`${joinOpNode}((JOIN))`);
                edges.push(`${currentNode} --> ${joinOpNode}`);
                edges.push(`${joinTableNode} --> ${joinOpNode}`);
                currentNode = joinOpNode;
                if (j.on) {
                    let condition = convertWhereClause(j.on);
                    let selectNode = nextId();
                    nodes.push(`${selectNode}[σ: ${condition}]`);
                    edges.push(`${currentNode} --> ${selectNode}`);
                    currentNode = selectNode;
                }
            });
        }

        // Process the WHERE clause.
        if (query.where) {
            let selectNode = nextId();
            let condition = convertWhereClause(query.where);
            nodes.push(`${selectNode}[σ: ${condition}]`);
            edges.push(`${currentNode} --> ${selectNode}`);
            currentNode = selectNode;
        }

        // Process the projection (SELECT columns).
        if (query.columns &&
            !(query.columns.length === 1 && query.columns[0].expr && query.columns[0].expr.type === 'star')
        ) {
            let projNode = nextId();
            const colList = query.columns
                .map((col: any) => {
                    if (col.expr && col.expr.column) {
                        return col.expr.column;
                    } else if (col.expr && col.expr.value) {
                        return col.expr.value;
                    }
                    return '';
                })
                .filter((s: string) => s !== '')
                .join(', ');
            nodes.push(`${projNode}[π: ${colList}]`);
            edges.push(`${currentNode} --> ${projNode}`);
            currentNode = projNode;
        }

        diagram += nodes.join('\n') + '\n' + edges.join('\n');
        diagramParts.push(diagram);
    }
    return diagramParts.join('\n\n');
}

/**
 * Helper function to convert a WHERE (or JOIN ON) clause expression
 * into a string. This simple implementation handles binary expressions,
 * column references, and literals.
 * @param expr The expression to convert
 * @returns The string representation of the expression
 */
function convertWhereClause(expr: any): string {
    if (!expr) {
        return '';
    }
    if (expr.type === 'binary_expr') {
        const left = convertWhereClause(expr.left);
        const operator = expr.operator;
        const right = convertWhereClause(expr.right);
        return `${left} ${operator} ${right}`;
    } else if (expr.type === 'column_ref') {
        return expr.column;
    } else if (expr.type === 'number' || expr.type === 'string' || expr.type === 'param'  || typeof expr.type === 'string') {
        return expr.value;
    } else if (typeof expr === 'string') {
        return expr;
    } else {
        return 'unsupported_expr';
    }
}