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
const createRelationalAlgebra_1 = require("../commands/createRelationalAlgebra");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = __importStar(require("vscode"));
// import * as myExtension from '../../extension';
// James was here
suite('CreateRelationalAlgebra: Parser Test', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Edge Case', () => {
        const ast = "";
        const result = (0, createRelationalAlgebra_1.convertToRelationalAlgebra)(ast);
        assert.strictEqual(result, '%% No valid AST found');
    });
    test('Single table SELECT query', () => {
        const ast = [{
                type: 'select',
                from: [{ table: 'users' }],
                columns: [{ expr: { type: 'column_ref', column: 'id' } }]
            }];
        const result = (0, createRelationalAlgebra_1.convertToRelationalAlgebra)(ast);
        assert.strictEqual(result, 'flowchart BT\nnode0[users]\nnode1[π: id]\nnode0 --> node1');
    });
});
//# sourceMappingURL=createRelationalAlgebra.test.js.map