"use strict";
/**
 * Data structures to store ER diagram information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSQLForERDiagram = parseSQLForERDiagram;
/**
 * Parses a SQL string to extract table definitions from CREATE TABLE statements.
 *
 * @param sqlText A string containing SQL code.
 * @returns Either an ERDiagram object with the parsed information or an object with an error message.
 */
function parseSQLForERDiagram(sqlText) {
    const erDiagram = { tables: [] };
    // Regular expression to match CREATE TABLE statements.
    // This matches a query like:
    //    CREATE TABLE tableName ( ... );
    const createTableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)\);/gi;
    let match;
    while ((match = createTableRegex.exec(sqlText)) !== null) {
        const tableName = match[1];
        const tableContent = match[2];
        // Initialize a new table definition.
        const tableDef = {
            name: tableName,
            columns: [],
            primaryKey: [],
            foreignKeys: []
        };
        let primaryKeyFound = false;
        // Split the content inside the parentheses into individual definitions.
        // This helper splits on commas that are NOT within nested parentheses.
        const lines = splitSQLColumns(tableContent);
        // Process each line (each line is either a column definition or a table-level constraint).
        for (let line of lines) {
            line = line.trim();
            if (!line)
                continue;
            // Check for a table-level PRIMARY KEY constraint.
            if (/^PRIMARY\s+KEY/i.test(line)) {
                if (primaryKeyFound) {
                    return { error: `Multiple primary key definitions found in table ${tableName}.` };
                }
                primaryKeyFound = true;
                // Expected format: PRIMARY KEY (col1, col2, ...)
                const pkMatch = line.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
                if (pkMatch) {
                    const pkColumns = pkMatch[1]
                        .split(",")
                        .map((col) => col.trim());
                    tableDef.primaryKey = pkColumns;
                }
            }
            // Check for a table-level FOREIGN KEY constraint.
            else if (/^FOREIGN\s+KEY/i.test(line)) {
                // Expected format: FOREIGN KEY (col1, col2) REFERENCES refTable(refCol1, refCol2)
                const fkMatch = line.match(/FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+(\w+)\s*\(([^)]+)\)/i);
                if (fkMatch) {
                    const fkColumns = fkMatch[1]
                        .split(",")
                        .map((col) => col.trim());
                    const refTable = fkMatch[2].trim();
                    const refColumns = fkMatch[3]
                        .split(",")
                        .map((col) => col.trim());
                    tableDef.foreignKeys.push({
                        columns: fkColumns,
                        referencesTable: refTable,
                        referencesColumns: refColumns
                    });
                }
            }
            // Otherwise, assume the line defines a column.
            else {
                // A regex for a column definition:
                //   columnName dataType [constraints stuff...]
                const colMatch = line.match(/^(\w+)\s+([\w\(\)]+)(.*)$/);
                if (colMatch) {
                    const colName = colMatch[1];
                    const colType = colMatch[2];
                    let constraintsPart = colMatch[3].trim();
                    // Process inline PRIMARY KEY constraint if present.
                    if (/\bPRIMARY\s+KEY\b/i.test(constraintsPart)) {
                        if (primaryKeyFound) {
                            return { error: `Multiple primary key definitions found in table ${tableName}.` };
                        }
                        primaryKeyFound = true;
                        tableDef.primaryKey.push(colName);
                        // Remove the PRIMARY KEY clause from constraintsPart
                        constraintsPart = constraintsPart.replace(/\bPRIMARY\s+KEY\b/ig, '').trim();
                    }
                    // Process inline FOREIGN KEY constraint if present.
                    if (/\bREFERENCES\b/i.test(constraintsPart)) {
                        // This regex will match both "REFERENCES refTable(refCol)" 
                        // and "REFERENCES refTable" (if no columns are provided).
                        const inlineFKRegex = /\bREFERENCES\s+(\w+)(?:\s*\(([^)]+)\))?/i;
                        const fkMatch = constraintsPart.match(inlineFKRegex);
                        if (fkMatch) {
                            const refTable = fkMatch[1].trim();
                            const refColumns = fkMatch[2]
                                ? fkMatch[2].split(",").map((col) => col.trim())
                                : [];
                            tableDef.foreignKeys.push({
                                columns: [colName],
                                referencesTable: refTable,
                                referencesColumns: refColumns
                            });
                        }
                        // Remove the REFERENCES clause (and any potential "FOREIGN KEY" token) from rawConstraints.
                        constraintsPart = constraintsPart
                            .replace(/\bREFERENCES\s+\w+(?:\s*\([^)]+\))?/ig, '')
                            .replace(/\bFOREIGN\s+KEY\b/ig, '')
                            .trim();
                    }
                    // Any tokens left in rawConstraints are added as column constraints.
                    const tokens = constraintsPart
                        ? constraintsPart.split(/\s+/).filter(tok => tok.length > 0)
                        : [];
                    const columnDef = {
                        name: colName,
                        type: colType,
                        constraints: tokens.length > 0 ? tokens : undefined
                    };
                    tableDef.columns.push(columnDef);
                }
            }
        }
        erDiagram.tables.push(tableDef);
    }
    if (erDiagram.tables.length === 0) {
        return { error: "No CREATE TABLE statements found. Cannot generate ER Diagram." };
    }
    return erDiagram;
}
/**
 * Splits the contents of a CREATE TABLE parentheses section into an array of definitions.
 * This function splits on commas that are not inside nested parentheses.
 *
 * @param tableContent The text inside the parentheses of a CREATE TABLE statement.
 * @returns An array of strings, each being a column definition or a constraint.
 */
function splitSQLColumns(tableContent) {
    const result = [];
    let current = "";
    let parenCount = 0;
    for (const char of tableContent) {
        if (char === "(") {
            parenCount++;
        }
        else if (char === ")") {
            parenCount--;
        }
        // When we see a comma at the top level (parenCount is 0), split here.
        if (char === "," && parenCount === 0) {
            result.push(current);
            current = "";
        }
        else {
            current += char;
        }
    }
    if (current.trim() !== "") {
        result.push(current);
    }
    return result;
}
//# sourceMappingURL=sqlParser.js.map