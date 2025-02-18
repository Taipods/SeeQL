import * as assert from 'assert';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';
import { convertToRelationalAlgebra } from '../commands/createRelationalAlgebra';
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
// James was here

suite('CreateRelationalAlgebra: Parser Test', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Edge Case', () => {
        const ast = "";
        const result = convertToRelationalAlgebra(ast);
        assert.strictEqual(result, '%% No valid AST found');
    });

    test('Single table SELECT query', () => {
        const ast = [{
            type: 'select',
            from: [{ table: 'users' }],
            columns: [{ expr: { type: 'column_ref', column: 'id' } }]
        }];
        const result = convertToRelationalAlgebra(ast);
        assert.strictEqual(result, 'flowchart BT\nnode0[users]\nnode1[π: id]\nnode0 --> node1');
    });

    test('Where Statements', () => {

    });
});