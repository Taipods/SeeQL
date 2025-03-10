// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { createDiagram } from './commands/createDiagram';
import { createRelationalAlgebra } from './commands/createRelationalAlgebra';
import { openDB, pullDB, createDB } from './sqlite/DBManager';
import {runQuery } from './sqlite/RunQuery';
import { SQLCodeLensProvider } from './sqlite/SQLCodeLensProvider';
import { openSQLQueryPanel } from './commands/generateSQLQuery';

// So this is the DB that stores multiple tables insides (collections of tables)
export let db: sqlite3.Database | null = null; // constant for DB

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
        vscode.commands.registerCommand('seeql.createDiagram', () => createDiagram(context))
	);

	context.subscriptions.push(
        vscode.commands.registerCommand('seeql.createRelationalAlgebra', createRelationalAlgebra)
    );

	// Updates/Pull DB from File
	context.subscriptions.push(
			vscode.commands.registerCommand('seeql.openDb', async () => {
				db = await pullDB();
				// Seems like it's not posting the message
				if (db !== null) {
					vscode.window.showInformationMessage("Open sesame");
				}
			})
		);

	// create db from csv and sql
	context.subscriptions.push(
		vscode.commands.registerCommand('seeql.createDB', async () => {
			db = await createDB();
			// Seems like it's not posting the message
			if (db !== null) {
				vscode.window.showInformationMessage("plzsplsplzlzplpzlz");
				}
			})
		);
	// All the error handling is done inside the call to the wrapper
	// Gonna replace with another call on push button or something
	context.subscriptions.push(
		vscode.commands.registerCommand('seeql.runQuery', async (query: string) => {
			if (!db) {
				vscode.window.showInformationMessage("Before running a query, please open a database. Run SeeQl: Open DB");
				return;
			}
				// console.log("Query string:", query);
        runQuery(db, query);
		})
	);

	// Register SQL CodeLensProvider
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ language: "sql" }, new SQLCodeLensProvider())
    );

	// Open SQL Query Generator Panel
	context.subscriptions.push(
		vscode.commands.registerCommand("seeql.generateSQLQuery", () => {
			openSQLQueryPanel(); // Opens the webview panel (no need to await or return anything)
		})
	);
}


// This method is called when your extension is deactivated
export function deactivate() {
	// Close down Database given one is open
	if (db) {
		db.close();
	}
}
