import * as sqlite3 from 'sqlite3';
import { runQuery , runQueryTest } from '../sqlite/RunQuery';
import * as assert from 'assert';

describe('Query Stats Tests', () => {
    let db: sqlite3.Database;

    //temp memory database
    before(() => {
        db = new sqlite3.Database(':memory:');
    });

    //close test db when all done testng
    after(() => {
        db.close();
    });

    //does it return 0 and 0 for error or watever other bad query
    it('should return 0 rows and 0 columns for an invalid query', async () => {
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

    //right # for good query
    it('should return the correct number of rows and columns for a valid query', async () => {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `CREATE TABLE test_table (
                    id INTEGER PRIMARY KEY,
                    yip TEXT,
                    yap INTEGER
                );`,
                (err) => {
                    if (err) { 
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });

        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO test_table (yip, yap) VALUES ('Yipee', 10), ('Yompee', 100);`,
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });

        //run yipee query
        const validQuery = 'SELECT * FROM test_table;';
        let rowCount = 0;
        let columnCount = 0;

        await runQueryTest(db, validQuery).then((results) => {
            rowCount = results.rows.length;
            columnCount = results.rows.length > 0 ? Object.keys(results.rows[0]).length : 0;
        });

        assert.strictEqual(rowCount, 2); //2 rows
        assert.strictEqual(columnCount, 3); //id yip yap
    });
});