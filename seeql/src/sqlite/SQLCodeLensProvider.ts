import * as vscode from 'vscode';

export class SQLCodeLensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp = /\bSELECT\b/i; // detect SELECT statements

    public provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        this.codeLenses = [];
        const text = document.getText();
        const lines = text.split("\n");

        lines.forEach((line, i) => {
            if (this.regex.test(line)) {
                const position = new vscode.Position(i, 0);
                const range = new vscode.Range(position, position);
                const command: vscode.Command = {
                    title: "▶ Run Query",
                    command: "seeql.runQuery",
                    arguments: [document, i] // pass document and line number
                };
                this.codeLenses.push(new vscode.CodeLens(range, command));
            }
        });

        return this.codeLenses;
    }
}
