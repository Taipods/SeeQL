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
        assert.strictEqual(result, 'flowchart BT\nnode0[users]\nnode1["<b>π</b>: id"]\nnode0 --> node1');
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
                        'node1["<b>σ</b>: age > 30"]\n' +
                        'node2["<b>π</b>: id"]\n' +
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
                        'node2((<b>INNER</b>: users.role_id = roles.id))\n' +
                        'node3["<b>π</b>: users.id"]\n' +
                        'node0 --> node2\n' +
                        'node1 --> node2\n' +
                        'node2 --> node3';
        assert.strictEqual(result, expected);
    });

    test('Alias and Group By with Aggregates', () => {
        const ast = [{
            type: 'select',
            from: [
                { table: 'STUDENTS', as: 'S' },
                { table: 'ATHLETES', as: 'A' }
            ],
            where: {
                type: 'binary_expr',
                operator: 'AND',
                left: {
                    type: 'binary_expr',
                    operator: '=',
                    left: { type: 'column_ref', table: 'S', column: 'ID' },
                    right: { type: 'column_ref', table: 'A', column: 'ID' }
                },
                right: {
                    type: 'binary_expr',
                    operator: '>=',
                    left: { type: 'column_ref', column: 'Age' },
                    right: { type: 'number', value: 18 }
                }
            },
            columns: [
                { expr: { type: 'column_ref', table: 'A', column: 'Sport' } },
                { expr: { type: 'aggr_func', name: 'count', args: { expr: { type: 'column_ref', table: 'S', column: 'ID' } } }, as: 'C' }
            ],
            groupby: { columns: [{ table: 'A', column: 'Sport' }] }
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected =
            'flowchart BT\n' +
            'node0[STUDENTS S]\n' +
            'node1[ATHLETES A]\n' +
            'node2((<b>⋈</b>))\n' +
            'node3["<b>γ</b>: A.Sport, count(S.ID) -> C"]\n' +
            'node4["<b>σ</b>: S.ID = A.ID <b>AND</b> Age >= 18"]\n' +
            'node5["<b>π</b>: A.Sport, C"]\n' +
            'node0 --> node2\n' +
            'node1 --> node2\n' +
            'node2 --> node3\n' +
            'node3 --> node4\n' +
            'node4 --> node5';
        assert.strictEqual(result, expected);
    });

    test('Multiple Joins Test', () => {
        const ast = [{
            type: 'select',
            from: [
                { table: 'users' },
                { table: 'orders', join: 'INNER', on: { 
                    type: 'binary_expr', 
                    operator: '=', 
                    left: { type: 'column_ref', table: 'users', column: 'id' }, 
                    right: { type: 'column_ref', table: 'orders', column: 'user_id' } 
                } },
                { table: 'payments', join: 'INNER', on: { 
                    type: 'binary_expr', 
                    operator: '=', 
                    left: { type: 'column_ref', table: 'orders', column: 'id' }, 
                    right: { type: 'column_ref', table: 'payments', column: 'order_id' } 
                } }
            ],
            columns: [{ expr: { type: 'column_ref', table: 'users', column: 'id' } }]
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected =
            'flowchart BT\n' +
            'node0[users]\n' +
            'node1[orders]\n' +
            'node2((<b>INNER</b>: users.id = orders.user_id))\n' +
            'node3[payments]\n' +
            'node4((<b>INNER</b>: orders.id = payments.order_id))\n' +
            'node5["<b>π</b>: users.id"]\n' +
            'node0 --> node2\n' +
            'node1 --> node2\n' +
            'node2 --> node4\n' +
            'node3 --> node4\n' +
            'node4 --> node5';
        assert.strictEqual(result, expected);
    });

    test('Explicit LEFT OUTER JOIN Test', () => {
        const ast = [{
            type: 'select',
            from: [
                { table: 'employees' },
                { table: 'departments', join: 'LEFT OUTER JOIN', on: { 
                    type: 'binary_expr', 
                    operator: '=', 
                    left: { type: 'column_ref', table: 'employees', column: 'dept_id' }, 
                    right: { type: 'column_ref', table: 'departments', column: 'id' } 
                } }
            ],
            columns: [{ expr: { type: 'column_ref', table: 'employees', column: 'name' } }]
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected =
            'flowchart BT\n' +
            'node0[employees]\n' +
            'node1[departments]\n' +
            'node2((<b>LEFT OUTER JOIN</b>: employees.dept_id = departments.id))\n' +
            'node3["<b>π</b>: employees.name"]\n' +
            'node0 --> node2\n' +
            'node1 --> node2\n' +
            'node2 --> node3';
        assert.strictEqual(result, expected);
    });

    test('Group By and Having with Aggregate', () => {
        // Equivalent SQL:
        // SELECT category
        // FROM products
        // WHERE price < 100
        // GROUP BY category
        // HAVING count(*) > 10;
        const ast = [{
            type: 'select',
            from: [{ table: 'products' }],
            where: { 
                type: 'binary_expr', 
                operator: '<', 
                left: { type: 'column_ref', column: 'price' }, 
                right: { type: 'number', value: 100 } 
            },
            columns: [{ expr: { type: 'column_ref', column: 'category' } }],
            groupby: { columns: [{ table: 'products', column: 'category' }] },
            having: { 
                type: 'binary_expr', 
                operator: '>', 
                left: { 
                    type: 'aggr_func', 
                    name: 'count', 
                    args: { expr: { type: 'star', value: '*' } } 
                }, 
                right: { type: 'number', value: 10 } 
            }
        }];
        const result = convertToRelationalAlgebra(ast);
        const expected = 'flowchart BT\n' +
                         'node0[products]\n' +
                         'node1["<b>γ</b>: products.category, count(*) -> count(*)"]\n' +
                         'node2["<b>σ</b>: price < 100 <b>AND</b> count(*) > 10"]\n' +
                         'node3["<b>π</b>: category"]\n' +
                         'node0 --> node1\n' +
                         'node1 --> node2\n' +
                         'node2 --> node3';
        assert.strictEqual(result, expected);
    });
});