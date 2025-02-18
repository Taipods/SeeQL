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

    test('WHERE clause', () => {
        const ast = [{
            type: 'select',
            from: [{ table: 'users' }],
            where: { type: 'binary_expr', left: { type: 'column_ref', column: 'age' }, operator: '>', right: { type: 'number', value: 30 } },
            columns: [{ expr: { type: 'column_ref', column: 'id' } }]
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected = 'flowchart BT\n' +
                        'node0[users]\n' +
                        'node1[σ: age > 30]\n' +
                        'node2[π: id]\n' +
                        'node0 --> node1\n' +
                        'node1 --> node2';
        assert.strictEqual(result, expected);
    });

    test('Join Statements', () => {
        const ast = [{
            type: 'select',
            from: [{ table: 'users' }, { table: 'roles', join: 'INNER', on: { type: 'binary_expr', left: { type: 'column_ref', column: 'users.role_id' }, operator: '=', right: { type: 'column_ref', column: 'roles.id' } } }],
            columns: [{ expr: { type: 'column_ref', column: 'users.id' } }]
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected = 'flowchart BT\n' +
                        'node0[users]\n' +
                        'node1[roles]\n' +
                        'node2((JOIN))\n' +
                        'node3[π: users.id]\n' +
                        'node0 --> node2\n' +
                        'node1 --> node2\n' +
                        'node2 --> node3';
        assert.strictEqual(result, expected);
    });
});