import * as vscode from 'vscode';

/**
* This class parses through a SQL file and finds SELECT statements, adding buttons.
**/
export class SQLCodeLensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp = /\bSELECT\b/i;


    /**
    * This finds all SELECT SQL queries on a file, adding a run button to each query.
    * @param document A document with SQL queries
    * @returns An array with all the SELECT queries in the SQL file
    **/
    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        this.codeLenses = [];
        const text = document.getText(); // Get the entire text of the document
        const lines = text.split("\n");

        // Track whether we are inside a SELECT statement
        let inSelectStatement = false;
        let selectStatement = "";
        let startLine = 0;

        lines.forEach((line, i) => {
            // Check if the line contains a SELECT statement
            if (this.regex.test(line)) {
                inSelectStatement = true;
                selectStatement = line;
                startLine = i;
            // Given in SELECT, keep storing statement, and check
            // if lines end with semi colon
            } else if (inSelectStatement) {
                selectStatement += "\n" + line;
                if (line.trim().endsWith(";")) {
                    inSelectStatement = false;
                    // Following Creates the button for each Select statements
                    const position = new vscode.Position(startLine, 0);
                    const range = new vscode.Range(position, new vscode.Position(i, line.length));
                    const command: vscode.Command = {
                        title: "▶ Run Query",
                        command: "seeql.runQuery",
                        arguments: [selectStatement] // Pass only the query string
                    };

                    console.log("Generated query:", selectStatement); // Log the generated query
                    // Add the CodeLens to the array
                    this.codeLenses.push(new vscode.CodeLens(range, command));
                    selectStatement = "";
                }
            }
        });
        return this.codeLenses;
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens> {
        return codeLens;
    }
}