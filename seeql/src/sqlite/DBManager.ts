import * as sqlite3 from 'sqlite3';
import * as vscode from 'vscode';
import * as path from 'path';
import { printDBTableNames } from './RunQuery';

// This file is used to for async functions used for pulling .DB files
// And or using a create table statement on a CSV


/*
TODO: Return WebView of the Table, Close DB when user Wants new DB to be
opened
This function Pulls a .DB file for future call to Run SQL querry
@Param: Requires a callback ish varible to store DB object
@Return: Returns a DB object for use
@exceptions: Throws when can't open a file or user doesn't select file
*possibly have to fixed amount of file selet or inform user first file selected
*/
export async function pullDB(): Promise<sqlite3.Database | null> {
  // This ask for a db file from ur directory stores the object inside uri
  const uri = await vscode.window.showOpenDialog({ filters: { 'Database Files': ['db'] } });
  // Checks if uri array is empty or not (aka if user select or not)
  if (!uri || uri.length === 0) {
    return null;
  }
  // Takes the db path from the first index
  // Since user can only select one I think
  // TODO: Might have to limit the Selection somehow
  // Also as well as print out, Which simple way is to call
  // Run querry which will print out the table using a simple
  // SELECT * FROM DB
  const dbPath = uri[0].fsPath;

  // return a new DB object and or error depending on
  // if failed to open .DB file
  return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
              vscode.window.showErrorMessage('Failed to open database: ' + err.message);
              reject(err);
          } else {
              vscode.window.showInformationMessage('Database opened: ' + path.basename(dbPath));
              printDBTableNames(db);
              resolve(db);
          }
      });
  });
}

/*
TODO: Function creates a DB from sql file with Create Table command
*/
export async function CreateDB() {

}
