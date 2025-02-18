"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sqlite3 = __importStar(require("sqlite3"));
const RunQuery_1 = require("../sqlite/RunQuery");
suite('Query Stats Tests', () => {
    let db;
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
            await (0, RunQuery_1.runQueryTest)(db, invalidQuery);
        }
        catch (err) {
            assert.strictEqual(rowCount, 0);
            assert.strictEqual(columnCount, 0);
        }
    });
    test('should return the correct number of rows and columns for a valid query', async () => {
        await new Promise((resolve, reject) => {
            db.run(`CREATE TABLE test_table (
                    id INTEGER PRIMARY KEY,
                    yip TEXT,
                    yap INTEGER
                );`, (err) => (err ? reject(err) : resolve()));
        });
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO test_table (yip, yap) VALUES ('Yipee', 10), ('Yompee', 100);`, (err) => (err ? reject(err) : resolve()));
        });
        const validQuery = 'SELECT * FROM test_table;';
        let rowCount = 0;
        let columnCount = 0;
        await (0, RunQuery_1.runQueryTest)(db, validQuery).then((results) => {
            rowCount = results.rows.length;
            columnCount = results.rows.length > 0 ? Object.keys(results.rows[0]).length : 0;
        });
        assert.strictEqual(rowCount, 2);
        assert.strictEqual(columnCount, 3);
    });
});
//# sourceMappingURL=queryStats.test.js.map