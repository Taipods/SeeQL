// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { createDiagram } from './commands/createDiagram';
import { createRelationalAlgebra } from './commands/createRelationalAlgebra';
import { pullDB } from './sqlite/DBManager';
import { printDBTableNames, runQuery } from './sqlite/RunQuery';

// So this is the DB that stores multiple tables insides (collections of tables)
let db: sqlite3.Database | null = null; // constant for DB

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "seeql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	// Updates/Pull DB from File
	context.subscriptions.push(
			vscode.commands.registerCommand('seeql.openDb', async () => {
				db = await pullDB();
				// Seems like it's not posting the message
				if (db != null) {
					vscode.window.showInformationMessage("Open sesame");
				}
			})
		);
	// All the error handling is done inside the call to the wrapper
	// Gonna replace with another call on push button or something
	context.subscriptions.push(
		vscode.commands.registerCommand('seeql.runQuery', async () => {
			if (!db) {
				vscode.window.showInformationMessage("Brother where my promised DB dawg");
				return;
			}
			runQuery(db);
			// printDBTableNames(db);
		})
	);

  context.subscriptions.push(
        vscode.commands.registerCommand('seeql.createDiagram', createDiagram)
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('seeql.createRelationalAlgebra', createRelationalAlgebra)
    );
}


// This method is called when your extension is deactivated
export function deactivate() {
	// Close down Database given one is open
	if (db) {db.close();}
}
