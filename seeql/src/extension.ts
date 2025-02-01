// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "seeql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('seeql.createDiagram', async () => {
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
        } else {
            vscode.window.showInformationMessage('No files selected.');
        }
    }));

	context.subscriptions.push(vscode.commands.registerCommand('seeql.createRelationalAlgebra', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Create a Relational Algebra Diagram');
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
