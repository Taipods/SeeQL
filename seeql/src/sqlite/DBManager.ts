import * as sqlite3 from 'sqlite3';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import csv from 'csv-parser';
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

  // call openDb to open it
  return openDB(dbPath);
}


//open db given path ):
export async function openDB(dbPath: string): Promise<sqlite3.Database | null> {
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


// /*
// TODO: Function creates a DB from sql file or csv with Create Table command
// */
// export async function CreateDB() {

// }

// Helper function to create a new SQLite database
function createNewDatabase(dbPath: string): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
                console.log("bro please");
            } else {
                resolve(db);
                console.log("easy");
            }
        });
    });
}

// Helper function to create a table from a CSV file
async function createDBFromCSV(csvPath: string, dbPath: string): Promise<void> {
    const db = await createNewDatabase(dbPath);
    const tableName = path.basename(csvPath, '.csv');

    return new Promise((resolve, reject) => {
        const rows: any[] = [];
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('headers', (headers: string[]) => {
                // Log the headers
                console.log('Headers:', headers);

                // Create a table with the CSV headers as columns
                const columns = headers.map((header) => `"${header}" TEXT`).join(', ');
                const createTableSQL = `CREATE TABLE "${tableName}" (${columns});`;
                console.log('Create Table SQL:', createTableSQL);

                db.run(createTableSQL, (err) => {
                    if (err) {
                        console.error('Error creating table:', err);
                        reject(err);
                    }
                });
            })
            .on('data', (row: any) => {
                // Log each row
                console.log('Row:', row);

                // Replace empty values with NULL
                const cleanedRow: any = {};
                for (const [key, value] of Object.entries(row)) {
                    cleanedRow[key] = value === '' ? null : value;
                }
                rows.push(cleanedRow);
            })
            .on('end', () => {
                // Log the number of rows
                console.log('Total rows:', rows.length);

                if (rows.length === 0) {
                    resolve(); // No rows to insert
                    return;
                }

                // Insert CSV data into the table
                const insertSQL = `INSERT INTO "${tableName}" VALUES (${Object.keys(rows[0])
                    .map(() => '?')
                    .join(', ')});`;
                console.log('Insert SQL:', insertSQL);

                const stmt = db.prepare(insertSQL);
                rows.forEach((row, index) => {
                    const values = Object.values(row);
                    console.log(`Inserting row ${index + 1}:`, values);

                    stmt.run(values, (err) => {
                        if (err) {
                            console.error(`Error inserting row ${index + 1}:`, err);
                            reject(err);
                        }
                    });
                });
                stmt.finalize();
                resolve();
            })
            .on('error', (err) => {
                console.error('CSV read error:', err);
                reject(err);
            });
    });
}
// Helper function to create a database from an SQL script
    async function createDBFromSQL(sqlPath: string, dbPath: string): Promise<void> {
        const db = await createNewDatabase(dbPath);
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');

        return new Promise((resolve, reject) => {
            db.exec(sqlScript, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

/*
Function creates a DB from a CSV file or SQL script.
*/
export async function createDB(): Promise<sqlite3.Database | null> {
    // Prompt the user to select a CSV or SQL file
    const uri = await vscode.window.showOpenDialog({
        filters: { 'CSV Files': ['csv'], 'SQL Files': ['sql'] },
    });
    if (!uri || uri.length === 0) {
        return null;
    }

    const filePath = uri[0].fsPath;
    const fileExtension = path.extname(filePath).toLowerCase();

    // Prompt the user to specify the output database path
    const dbUri = await vscode.window.showSaveDialog({
        filters: { 'Database Files': ['db'] },
        defaultUri: vscode.Uri.file(path.join(path.dirname(filePath), 'new_database.db')),
    });
    if (!dbUri) {
        return null;
    }
    const dbPath = dbUri.fsPath;

    try {
        if (fileExtension === '.csv') {
            await createDBFromCSV(filePath, dbPath);
            vscode.window.showInformationMessage(`Database created from CSV: ${path.basename(dbPath)}`);
        } else if (fileExtension === '.sql') {
            await createDBFromSQL(filePath, dbPath);
            vscode.window.showInformationMessage(`Database created from SQL: ${path.basename(dbPath)}`);
        } else {
            vscode.window.showErrorMessage('Unsupported file type. Please select a CSV or SQL file.');
            return null;
        }

        // Open the newly created database
        return await openDB(dbPath);
    } catch (err) {
        vscode.window.showErrorMessage(`Failed to create database ):`);
        return null;
    }
}