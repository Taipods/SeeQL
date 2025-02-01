// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { createDiagram } from './commands/createDiagram';
import { createRelationalAlgebra } from './commands/createRelationalAlgebra';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "seeql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
    context.subscriptions.push(
        vscode.commands.registerCommand('seeql.createDiagram', createDiagram)
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('seeql.createRelationalAlgebra', createRelationalAlgebra)
    );
}


// This method is called when your extension is deactivated
export function deactivate() {}
