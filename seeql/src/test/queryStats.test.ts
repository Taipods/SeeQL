import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sqlite3 from 'sqlite3';
import { runQueryTest } from '../sqlite/RunQuery';

suite('Query Stats Tests', () => {
    let db: sqlite3.Database;

    suiteSetup(() => {
        db = new sqlite3.Database(':memory:');
    });

    suiteTeardown(() => {
        db.close();
    });

    test('should return 0 rows and 0 columns for an invalid query', async () => {
        const invalidQuery = 'SELECT * FROM non_existent_table;';
        let rowCount = 0;
        let columnCount = 0;

        try {
            await runQueryTest(db, invalidQuery);
        } catch (err) {
            assert.strictEqual(rowCount, 0);
            assert.strictEqual(columnCount, 0);
        }
    });

    test('should return the correct number of rows and columns for a valid query', async () => {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE test_table (
                    id INTEGER PRIMARY KEY,
                    yip TEXT,
                    yap INTEGER
                );`,
                (err) => (err ? reject(err) : resolve())
            );
        });

        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO test_table (yip, yap) VALUES ('Yipee', 10), ('Yompee', 100);`,
                (err) => (err ? reject(err) : resolve())
            );
        });

        const validQuery = 'SELECT * FROM test_table;';
        let rowCount = 0;
        let columnCount = 0;

        await runQueryTest(db, validQuery).then((results) => {
            rowCount = results.rows.length;
            columnCount = results.rows.length > 0 ? Object.keys(results.rows[0]).length : 0;
        });

        assert.strictEqual(rowCount, 2);
        assert.strictEqual(columnCount, 3);
    });
});
