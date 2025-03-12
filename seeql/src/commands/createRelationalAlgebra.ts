import * as vscode from 'vscode';
import * as path from 'path';
import { Parser as SqlParser } from 'node-sql-parser';

/**
 * This function creates a relational algebra plan from a SQL file.
 */
export async function createRelationalAlgebra() {
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

    const sqlContent = fileContent.toString();
    //const ast = new SqlParser().astify(sqlContent);
    const parser = new SqlParser();
    const ast = parser.astify(sqlContent, { database: 'postgresql' });
    filePanel.webview.html = showTableNames(fileContents);
    createRelationalAlgebra.webview.html = showRelationalAlgebra(ast);
}

/**
 * Returns HTML showing the selected file contents.
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
 * Returns HTML showing the relational algebra plan.
 * The legend appears at the bottom.
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
          <h1>SeeQL: Relational Algebra</h1>
          <div class="mermaid">
            ${convertToRelationalAlgebra(ast)}
          </div>
          <div class="legend">
            <h2>Legend</h2>
            <table border="1">
              <tr><th>Symbol</th><th>Meaning</th></tr>
              <tr><td><b>σ</b></td><td>Selection</td></tr>
              <tr><td><b>π</b></td><td>Projection</td></tr>
              <tr><td><b>⋈</b></td><td>Join (with embedded conditions)</td></tr>
              <tr><td><b>γ</b></td><td>Grouping</td></tr>
              <tr><td><b>-</b></td><td>Difference (EXCEPT)</td></tr>
            </table>
          </div>
        </body>
        </html>
    `;
}

/**
 * Converts an AST (or array of ASTs) into a Mermaid diagram string representing the relational algebra plan.
 *
 * Features:
 *  - Implicit join conditions (from WHERE) are embedded in the join node’s label.
 *  - Table aliases are honored:
 *       * The first node for a table with an alias displays "OriginalTable -> Alias".
 *       * Column references use the alias (if defined).
 *  - The GROUP BY (γ) node includes explicit grouping attributes and aggregates.
 *    Aggregates are shown as "expr -> alias" (or "expr -> expr" if no alias is provided).
 *    Aggregates referenced in the SELECT and HAVING clauses are merged so they appear only once.
 *  - The projection (π) node for aggregates uses only the alias if defined.
 *  - All operator symbols and "AND" separators are wrapped in bold tags.
 *  - EXCEPT set operations are handled as before.
 */
export function convertToRelationalAlgebra(ast: any): string {
    if (!ast) { return '%% No valid AST found'; }
    if (!Array.isArray(ast)) { ast = [ast]; }
    let diagramParts: string[] = [];
    let queryCount = 0;
    let nodeId = 0;
    function nextId() { return `node${nodeId++}`; }

    /**
     * Processes a single SELECT query and returns its RA diagram components.
     */
    function processSelect(query: any): { nodes: string[], edges: string[], finalNode: string } {
        const fromArray = query.from ? (Array.isArray(query.from) ? query.from : [query.from]) : [];
        for (const f of fromArray) {
            if (f.expr && f.expr.ast) {
                return { nodes: [`%% Nested queries are unsupported`], edges: [], finalNode: "" };
            }
        }

        // Build alias mappings.
        const translationMapping: { [key: string]: string } = {};
        const displayMapping: { [key: string]: string } = {};
        for (const tbl of fromArray) {
            let alias: string = "";
            if (tbl.as) {
                alias = typeof tbl.as === 'object' ? (tbl.as.value || tbl.as.toString()) : tbl.as;
            }
            translationMapping[tbl.table] = alias ? alias : tbl.table;
            if (alias) {
                translationMapping[alias] = alias;
            }
            displayMapping[tbl.table] = alias ? `${tbl.table} ${alias}` : tbl.table;
        }

        // Helper to convert expressions using the alias mapping.
        function convertClause(expr: any, parentOp?: string): string {
            // Handle expression lists differently based on the parent operator.
            if (expr.type === 'expr_list' && Array.isArray(expr.value)) {
                if (parentOp && (parentOp.toUpperCase() === 'IN' || parentOp.toUpperCase() === 'NOT IN')) {
                    // For IN/NOT IN, join with commas and wrap in parentheses.
                    return '(' + expr.value.map((item: any) => convertClause(item)).join(', ') + ')';
                } else {
                    // Default handling (for BETWEEN)
                    return expr.value.map((item: any) => convertClause(item)).join(" <b>AND</b> ");
                }
            }
            if (!expr) { return ''; }
            if (expr.type === 'binary_expr') {
                const left = convertClause(expr.left);
                const op = expr.operator;
                const right = convertClause(expr.right, op);
                return `${left} ${op} ${right}`;
            } else if (expr.type === 'column_ref') {
                // Safely handle node-sql-parser's objects
                let tableName = (expr.table && typeof expr.table === 'object') ? expr.table.value : "";
                if (typeof expr.table === "string") {
                    tableName = expr.table;
                }
                const columnName = (expr.column && typeof expr.column === 'object')
                ? expr.column.expr.value
                : expr.column;
                // Apply alias mapping
                const mappedTable = tableName ? (translationMapping[tableName] || tableName) : '';
                return mappedTable ? `${mappedTable}.${columnName}` : columnName;
            } else if (expr.type === 'aggr_func') {
                const argStr = expr.args && expr.args.expr ? convertClause(expr.args.expr) : '';
                return `${expr.name}(${argStr})`;
            } else if (expr.type === 'number' || expr.type === 'string' || expr.type === 'param' || typeof expr.type === 'string') {
                return expr.value;
            } else if (typeof expr === 'string') {
                return expr;
            } else {
                return 'unsupported_expr';
            }
        }

        // NEW: Recursively extract aggregates from the HAVING clause.
        function extractAggregatesFromExpr(expr: any): { key: string, value: string }[] {
            let aggs: { key: string, value: string }[] = [];
            if (!expr) { return aggs; }
            if (expr.type === 'aggr_func') {
                const aggStr = convertClause(expr);
                // In HAVING, no alias is provided; use self.
                aggs.push({ key: aggStr, value: aggStr });
            }
            if (expr.type === 'binary_expr') {
                aggs = aggs.concat(extractAggregatesFromExpr(expr.left));
                aggs = aggs.concat(extractAggregatesFromExpr(expr.right));
            }
            return aggs;
        }

        let nodes: string[] = [];
        let edges: string[] = [];
        let currentNode = "";
        let joinedTables: string[] = [];

        // Split WHERE conditions.
        let joinConditions: any[] = [];
        let nonJoinConditions: any[] = [];
        const allFromTables = fromArray.map((tbl: any) => tbl.table);
        if (query.where && allFromTables.length > 1) {
            const split = splitWhereConditions(query.where, allFromTables);
            joinConditions = split.joinConditions;
            nonJoinConditions = split.nonJoinConditions;
        } else if (query.where) {
            nonJoinConditions = [query.where];
        }

        // Process FROM clause and build join tree.
        if (fromArray.length > 0) {
            const firstTable = fromArray[0];
            currentNode = nextId();
            nodes.push(`${currentNode}[${displayMapping[firstTable.table]}]`);
            joinedTables.push(firstTable.table);

            for (let i = 1; i < fromArray.length; i++) {
                const tbl = fromArray[i];
                if (tbl.expr && tbl.expr.ast) {
                    return { nodes: [`%% Nested queries are unsupported`], edges: [], finalNode: "" };
                }
                const tableNode = nextId();
                nodes.push(`${tableNode}[${displayMapping[tbl.table]}]`);
                // Build join node label.
                let joinOp = tbl.join ? tbl.join : "⋈";
                let joinLabel = `<b>${joinOp}</b>`;
                // Check for explicit ON condition.
                let explicitCond = tbl.on ? convertClause(tbl.on) : "";
                // Implicit join conditions.
                const applicableConds = joinConditions.filter((cond) => {
                    if (cond.type === 'binary_expr' && cond.operator === '=') {
                        const leftTbl = cond.left.table;
                        const rightTbl = cond.right.table;
                        return ((joinedTables.includes(leftTbl) && rightTbl === tbl.table) ||
                                (joinedTables.includes(rightTbl) && leftTbl === tbl.table));
                    }
                    return false;
                });
                let implicitCond = "";
                if (applicableConds.length > 0) {
                    implicitCond = applicableConds.map(expr => convertClause(expr)).join(" <b>AND</b> ");
                    joinConditions = joinConditions.filter(cond => !applicableConds.includes(cond));
                }
                let condParts: string[] = [];
                if (explicitCond) { condParts.push(explicitCond); }
                if (implicitCond) { condParts.push(implicitCond); }
                if (condParts.length > 0) {
                    joinLabel = `${joinLabel}: ${condParts.join(" <b>AND</b> ")}`;
                }
                const joinNode = nextId();
                nodes.push(`${joinNode}((${joinLabel}))`);
                edges.push(`${currentNode} --> ${joinNode}`);
                edges.push(`${tableNode} --> ${joinNode}`);
                currentNode = joinNode;
                joinedTables.push(tbl.table);
            }
        } else {
            currentNode = nextId();
            nodes.push(`${currentNode}[No FROM clause]`);
        }

        // Process selection conditions and grouping.
        if (query.groupby && query.groupby.columns && query.groupby.columns.length > 0) {
            const explicitGroup = query.groupby.columns.map((col: any) => convertClause(col));
            // Extract aggregates from SELECT clause.
            const aggregateGroupSelect = query.columns.filter((col: any) => col.expr && col.expr.type === 'aggr_func')
                .map((col: any) => {
                    const exprStr = convertClause(col.expr);
                    const alias = col.as ? (typeof col.as === 'object' ? (col.as.value || col.as.toString()) : col.as) : exprStr;
                    return { key: exprStr, value: alias };
                });
            // Extract aggregates from HAVING clause.
            const aggregateGroupHaving = query.having ? extractAggregatesFromExpr(query.having) : [];
            // Combine aggregates using a Map (keyed on the aggregate expression).
            const aggregateMap = new Map<string, string>();
            for (const agg of aggregateGroupSelect) {
                if (!aggregateMap.has(agg.key) || (aggregateMap.get(agg.key) === agg.key && agg.value !== agg.key)) {
                    aggregateMap.set(agg.key, agg.value);
                }
            }
            for (const agg of aggregateGroupHaving) {
                if (!aggregateMap.has(agg.key) || (aggregateMap.get(agg.key) === agg.key && agg.value !== agg.key)) {
                    aggregateMap.set(agg.key, agg.value);
                }
            }
            const combinedAggregate = Array.from(aggregateMap.entries()).map(([key, val]) => `${key} -> ${val}`);
            // Combine explicit group columns and aggregates.
            const combinedGroup = Array.from(new Set([...explicitGroup, ...combinedAggregate]));
            const groupNode = nextId();
            nodes.push(`${groupNode}["<b>γ</b>: ${combinedGroup.join(', ')}"]`);
            edges.push(`${currentNode} --> ${groupNode}`);
            currentNode = groupNode;
            let sigmaConds: string[] = [];
            if (nonJoinConditions.length > 0) {
                sigmaConds.push(nonJoinConditions.map(expr => convertClause(expr)).join(" <b>AND</b> "));
            }
            if (query.having) {
                sigmaConds.push(convertClause(query.having));
            }
            if (sigmaConds.length > 0) {
                const sigmaNode = nextId();
                nodes.push(`${sigmaNode}["<b>σ</b>: ${sigmaConds.join(" <b>AND</b> ")}"]`);
                edges.push(`${currentNode} --> ${sigmaNode}`);
                currentNode = sigmaNode;
            }
        } else {
            if (nonJoinConditions.length > 0) {
                const sigmaNode = nextId();
                nodes.push(`${sigmaNode}["<b>σ</b>: ${nonJoinConditions.map(expr => convertClause(expr)).join(" <b>AND</b> ")}"]`);
                edges.push(`${currentNode} --> ${sigmaNode}`);
                currentNode = sigmaNode;
            }
            if (query.having) {
                const sigmaNode = nextId();
                nodes.push(`${sigmaNode}["<b>σ</b>: ${convertClause(query.having)}"]`);
                edges.push(`${currentNode} --> ${sigmaNode}`);
                currentNode = sigmaNode;
            }
        }

        // Process Projection.
        if (query.columns && !(query.columns.length === 1
            && query.columns[0].expr
            && query.columns[0].expr.type === 'star')) {
      
            const projCols = query.columns.map((col: any) => {
                if (!col.expr) return '';
            
                // Use your existing convertClause for everything
                const exprStr = convertClause(col.expr);
            
                // If there's an alias, handle that
                const alias = col.as ? (typeof col.as === 'object' ? col.as.value : col.as) : exprStr;
            
                return alias;
            }).filter((s: string) => s !== '').join(', ');
            const projNode = nextId();
            nodes.push(`${projNode}["<b>π</b>: ${projCols}"]`);
            edges.push(`${currentNode} --> ${projNode}`);
            currentNode = projNode;
        }
        return { nodes, edges, finalNode: currentNode };
    }

    for (const query of ast) {
        queryCount++;
        if (query.type !== 'select') {
            diagramParts.push(`%% Query ${queryCount} is not a SELECT query. Unsupported.`);
            continue;
        }
        if (query.set_op && query.set_op.toUpperCase() === 'EXCEPT' && query._next) {
            const leftPlan = processSelect(query);
            const rightPlan = processSelect(query._next);
            if (leftPlan.finalNode === "" || rightPlan.finalNode === "") {
                diagramParts.push(`%% Query ${queryCount}: Nested queries are unsupported`);
                continue;
            }
            const diffNode = nextId();
            const diffNodeLabel = `${diffNode}[**_**]`;
            const diffEdgeLeft = `${leftPlan.finalNode} --> ${diffNode}`;
            const diffEdgeRight = `${rightPlan.finalNode} --> ${diffNode}`;
            const combinedNodes = [...leftPlan.nodes, ...rightPlan.nodes, diffNodeLabel];
            const combinedEdges = [...leftPlan.edges, ...rightPlan.edges, diffEdgeLeft, diffEdgeRight];
            const combinedDiagram = `flowchart BT\n` + combinedNodes.join('\n') + '\n' + combinedEdges.join('\n');
            diagramParts.push(combinedDiagram);
            continue;
        }
        const plan = processSelect(query);
        if (plan.finalNode === "") {
            diagramParts.push(`%% Query ${queryCount}: ${plan.nodes.join(' ')}`);
        } else {
            const diagram = `flowchart BT\n` + plan.nodes.join('\n') + '\n' + plan.edges.join('\n');
            diagramParts.push(diagram);
        }
    }
    return diagramParts.join('\n\n');
}

/**
 * Helper to split a WHERE clause into join and non-join conditions.
 */
function splitWhereConditions(expr: any, fromTables: string[]): { joinConditions: any[], nonJoinConditions: any[] } {
    let joinConds: any[] = [];
    let nonJoinConds: any[] = [];
    function helper(e: any) {
        if (e.type === 'binary_expr' && e.operator === 'AND') {
            helper(e.left);
            helper(e.right);
        } else {
            if (e.type === 'binary_expr' && e.operator === '=' &&
                e.left && e.right &&
                e.left.type === 'column_ref' && e.right.type === 'column_ref') {
                const leftTable = e.left.table;
                const rightTable = e.right.table;
                if (leftTable && rightTable && leftTable !== rightTable &&
                    fromTables.includes(leftTable) && fromTables.includes(rightTable)) {
                    joinConds.push(e);
                    return;
                }
            }
            nonJoinConds.push(e);
        }
    }
    helper(expr);
    return { joinConditions: joinConds, nonJoinConditions: nonJoinConds };
}