// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { createDiagram } from './commands/createDiagram';
import { createRelationalAlgebra } from './commands/createRelationalAlgebra';
import { openDB, pullDB, createDB } from './sqlite/DBManager';
import {runQuery } from './sqlite/RunQuery';
import { SQLCodeLensProvider } from './sqlite/SQLCodeLensProvider';
import { AzureDBConfig, CloudDBManager } from './cloudDB/CloudDBManager';
import { generateTableHTML } from './sqlite/DBwebview/view';
import { openSQLQueryPanel } from './commands/generateSQLQuery';

// So this is the DB that stores multiple tables insides (collections of tables)
export let db: sqlite3.Database | null = null; // constant for DB

// Global variable to hold the cloud DB configuration.
let globalAzureConfig: AzureDBConfig | null = null;

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
			// console.log("Query string:", query);
        	//runQuery(db, query);

			// Ask the user which target to run the query on.
			const targetChoice = await vscode.window.showQuickPick(
				['Local Database', 'Cloud Database'],
				{ placeHolder: 'Choose where to run the query' }
			);
			if (!targetChoice) {
				return;
			}
			const target = targetChoice === 'Cloud Database' ? 'cloud' : 'local';

			// If the cloud option is selected, ensure the cloud DB is configured.
			if (target === 'cloud' && !globalAzureConfig) {
				vscode.window.showErrorMessage('Cloud database not configured. Please run "Connect to Cloud Database" first.');
				return;
			}

			try {
				if (target === "local") {
					if (!db) {
						vscode.window.showInformationMessage("No open local database.");
						return;
					}
					runQuery(db, query);
				} else {
					if (globalAzureConfig === null) {
						vscode.window.showErrorMessage('Cloud database not configured. Please run "Connect to Cloud Database" first.');
					} else {
						  // Cloud query branch: create a CloudDBManager, connect, execute the query, and display the results
						  const cloudDB = new CloudDBManager(globalAzureConfig);
						  await cloudDB.connect();
						  const rows = await cloudDB.executeQuery(query);
						  await cloudDB.disconnect();
				  
						  console.log("Cloud query executed successfully:", rows);
				  
						  // Generate results statistics
						  const rowCount = rows.length;
						  const columnCount = rows.length > 0 ? Object.keys(rows[0]).length : 0;
				  
						  // Create and display a webview panel for the results
						  const panel = vscode.window.createWebviewPanel(
							'cloudResults',
							'Cloud Query Results',
							vscode.ViewColumn.One,
							{ enableScripts: true }
						  );
						  panel.webview.html =
							`<html>
								<head>
									<style>
										table { width: 100%; border-collapse: collapse; }
										th, td { border: 1px solid black; padding: 8px; text-align: left; }
										th { background-color: #f2f2f2; }
									</style>
								</head>
								<body>
									<h2>Cloud Query Results</h2>
									${generateTableHTML(rows)}
									<div class="stats">
										Rows: ${rowCount}, Columns: ${columnCount}
									</div>
								</body>
							</html>`;
						}
						vscode.window.showInformationMessage(`Query executed successfully.`);
					}
					} catch (error: any) {
						vscode.window.showErrorMessage(`Error executing query: ${error.message}`);
					}
				}
		)
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

	// Command to connect to a cloud database.
	let connectCloudDisposable = vscode.commands.registerCommand('seeql.connectCloud', async () => {
		try {
		  const server = await vscode.window.showInputBox({
			prompt: 'Enter Azure SQL Server (e.g., yourserver.database.windows.net)',
			ignoreFocusOut: true,
		  });
		  if (!server) { return; }
	
		  const user = await vscode.window.showInputBox({
			prompt: 'Enter Azure SQL Username',
			ignoreFocusOut: true,
		  });
		  if (!user) { return; }
	
		  const password = await vscode.window.showInputBox({
			prompt: 'Enter Azure SQL Password',
			password: true,
			ignoreFocusOut: true,
		  });
		  if (!password) { return; }
	
		  const database = await vscode.window.showInputBox({
			prompt: 'Enter Azure SQL Database Name',
			ignoreFocusOut: true,
		  });
		  if (!database) { return; }
	
		  // You can add further prompts for options if needed.
		  globalAzureConfig = {
			server,
			user,
			password,
			database,
			options: {
			  encrypt: true,
			  enableArithAbort: true,
			}
		  };
	
		  vscode.window.showInformationMessage('Cloud database configured successfully.');
		} catch (error: any) {
		  vscode.window.showErrorMessage(`Error configuring cloud database: ${error.message}`);
		}
	  });
	  context.subscriptions.push(connectCloudDisposable);
}


// This method is called when your extension is deactivated
export function deactivate() {
	// Close down Database given one is open
	if (db) {
		db.close();
	}
}
