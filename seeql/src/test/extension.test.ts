import * as assert from 'assert';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
// James was here

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});


suite('Parse Create Table', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Parse simple CREATE TABLE statement', () => {
        const sql = `CREATE TABLE users (
            id INT PRIMARY KEY,
            name VARCHAR(100)
        );`;
    
        const result = parseSQLForERDiagram(sql);
    
        assert.deepStrictEqual(result, {
            tables: [{
                name: 'users',
                columns: [
                    { name: 'id', type: 'INT', constraints: undefined },
                    { name: 'name', type: 'VARCHAR(100)', constraints: undefined }
                ],
                primaryKey: ['id'],
                foreignKeys: []
            }]
        });
    });
});