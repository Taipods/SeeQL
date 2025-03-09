import * as assert from 'assert';
import { parseSQLForERDiagram, ERDiagram } from '../parser/sqlParser';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

suite('CreateDiagram: ER Diagram Tests', () => {
    // Unable to test this. Might not be any need to tbh
});

suite('CreateDiagram: Create Table Tests/Parser', () => {
    vscode.window.showInformationMessage('Start all tests.');
    // Tests a basic CREATE TABLE statement
    // The most basic can be. Would output one table
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

    // Test the CREATE TABLE statement with multiple columns
    // Ensures that the parser is able to identify Foreign Keys, References meaning relationships
    test('Parse CREATE TABLE statement with foreign key', () => {
        const sql = `CREATE TABLE users (
            id INT PRIMARY KEY,
            name VARCHAR(100),
            role_id INT,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        );`;
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {
            tables: [{
                name: 'users',
                columns: [
                    { name: 'id', type: 'INT', constraints: undefined },
                    { name: 'name', type: 'VARCHAR(100)', constraints: undefined },
                    { name: 'role_id', type: 'INT', constraints: undefined }
                ],
                primaryKey: ['id'],
                foreignKeys: [{
                    columns: ['role_id'],
                    referencesColumns: ['id'],
                    referencesTable: 'roles'
                }]
            }]
        });
    });

    // Test the Basic Create Table and ensures that the parser is able to parse the SQL
    // Parameters: BasicCreateTable.sql
    // Ensures all parameters are parsed correctly
    test('Parse Actual File no references: BasicCreateTable', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'BasicCreateTable.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {tables: [{
            name: 'USERS',
            columns: [
                {name: 'id', type: 'INT', constraints: undefined},
                {name: 'USERNAME', type: 'varchar(50)', constraints: undefined},  
            ],
            primaryKey: ['id'],
            foreignKeys: [],
        }, {name: 'YUGAMI',
            columns: [
                {name: 'peak', type: 'INT', constraints: undefined},
                {name: 'USERNAME', type: 'varchar(50)', constraints: undefined},  
            ],
            primaryKey: ['peak'],
            foreignKeys: [],
        },{name: 'MANGA',
            columns: [
                {name: 'awesomeSauce', type: 'INT', constraints: undefined},
                {name: 'USERNAME', type: 'varchar(50)', constraints: undefined},  
            ],
            primaryKey: ['awesomeSauce'],
            foreignKeys: [],
        }]});
    });

    // Tests the parser through the demo.sql file
    // Parameters: demo.sql
    // Ensures tha tall parameters are parsed correctly
    test('Parse Actual File with references: demo', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'demo.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {tables: [{
            name: 'Nations',
            columns: [
                {name: 'nation_ID', type: 'int', constraints: undefined},
                {name: 'nation_name', type: 'varchar(255)', constraints: undefined},
                {name: 'total_population', type: 'int', constraints: undefined},
            ],
            primaryKey: ['nation_ID'],
            foreignKeys: [],
        }, {name: 'People',
            columns: [
                {name: 'person_ID', type: 'int', constraints: undefined},
                {name: 'surname', type: 'varchar(255)', constraints: undefined},
                {name: 'given_name', type: 'varchar(255)', constraints: undefined}, 
                {name: 'residence', type: 'varchar(255)', constraints: undefined}, 
                {name: 'town_ID', type: 'int', constraints: undefined}, 
                {name: 'nation_ID', type: 'int', constraints: undefined}, 
            ],
            primaryKey: ['person_ID'],
            foreignKeys: [
                {
                    columns: ['town_ID'],
                    referencesColumns: ['town_ID'],
                    referencesTable: 'Towns'
                },
                {
                    columns: ['nation_ID'],
                    referencesColumns: ['nation_ID'],
                    referencesTable: 'Nations'
                }]
        },{name: 'Towns',
            columns: [
                {name: 'town_ID', type: 'int', constraints: undefined},
                {name: 'town_name', type: 'varchar(255)', constraints: undefined},
                {name: 'nation_ID', type: 'int', constraints: undefined},
                {name: 'town_population', type: 'int', constraints: undefined},
            ],
            primaryKey: ['town_ID'],
            foreignKeys: [{
                columns: ['nation_ID'],
                referencesColumns: ['nation_ID'],
                referencesTable: 'Nations'
            }]
        }]});
    });

    test('Parse Actual File:  One-To-One', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'One-To-One.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {tables: [{
            name: 'Person',
            columns: [
                {name: 'person_id', type: 'int', constraints: undefined},
                {name: 'name', type: 'varchar(100)', constraints: ["NOT", "NULL"]},  
            ],
            primaryKey: ['person_id'],
            foreignKeys: [],
        }, {name: 'Passport',
            columns: [
                {name: 'passport_id', type: 'int', constraints: undefined},
                {name: 'person_id', type: 'int', constraints: ["UNIQUE"]},
                {name: 'passport_number', type: 'varchar(50)', constraints: ["NOT", "NULL"]},  
            ],
            primaryKey: ['passport_id'],
            foreignKeys: [{
                columns: ['person_id'],
                referencesColumns: ['person_id'],
                referencesTable: 'Person'
            }],
        }]});
    });

    test('Parse Actual File:  Many to Many', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'ManyToMany.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {
            tables: [{
                name: 'students',
                columns: [
                    { name: 'id', type: 'INT', constraints: undefined },
                    { name: 'name', type: 'VARCHAR(100)', constraints: ["NOT", "NULL"] },
                ],
                primaryKey: ['id'],
                foreignKeys: [],
            }, {
                name: 'courses',
                columns: [
                    { name: 'id', type: 'INT', constraints: undefined },
                    { name: 'title', type: 'VARCHAR(100)', constraints: ["NOT", "NULL"] },
                ],
                primaryKey: ['id'],
                foreignKeys: [],
            }, {
                name: 'student_courses',
                columns: [
                    { name: 'student_id', type: 'INT', constraints: undefined },
                    { name: 'course_id', type: 'INT', constraints: undefined },
                ],
                primaryKey: ['student_id', 'course_id'],
                foreignKeys: [{
                    columns: ['student_id'],
                    referencesColumns: ['id'],
                    referencesTable: 'students'
                }, {
                    columns: ['course_id'],
                    referencesColumns: ['id'],
                    referencesTable: 'courses'
                }],
            }]
        });
    });

    test('Parse Actual File:  dd', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'compositeKey.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {
            tables: [
                {
                    name: 'Cars',
                    columns: [
                        { name: 'vin', type: 'VARCHAR(20)', constraints: undefined },
                        { name: 'model', type: 'VARCHAR(50)', constraints: undefined },
                    ],
                    primaryKey: ['vin'],
                    foreignKeys: []
                },
                {
                    name: 'CarOwnership',
                    columns: [
                        { name: 'vin', type: 'VARCHAR(20)', constraints: undefined },
                        { name: 'owner_id', type: 'INT', constraints: undefined },
                    ],
                    primaryKey: ['vin', 'owner_id'],
                    foreignKeys: [{
                        columns: ['vin'],
                        referencesColumns: ['vin'],
                        referencesTable: 'Cars'
                    }]
                }
            ]
        });
    });

    test('Parse Actual File:  2nd Test', () => {
        const path = require('path');
        const filePath = path.resolve(__dirname, '..', '..', '..', 'seeql', 'src', 'test', 'sql_test_files', 'createDiagramFolder', 'compositetest.sql');
        const sql = fs.readFileSync(filePath, 'utf8');
        const result = parseSQLForERDiagram(sql);
        assert.deepStrictEqual(result, {
            tables: [
                {
                    name: 'Employees',
                    columns: [
                        { name: 'employee_id', type: 'INT', constraints: undefined },
                        { name: 'name', type: 'VARCHAR(100)', constraints: undefined },
                    ],
                    primaryKey: ['employee_id'],
                    foreignKeys: []
                },
                {
                    name: 'Projects',
                    columns: [
                        { name: 'project_id', type: 'INT', constraints: undefined },
                        { name: 'name', type: 'VARCHAR(100)', constraints: undefined },
                    ],
                    primaryKey: ['project_id'],
                    foreignKeys: []
                },
                {
                    name: 'EmployeeProjects',
                    columns: [
                        { name: 'employee_id', type: 'INT', constraints: undefined },
                        { name: 'project_id', type: 'INT', constraints: undefined },
                        { name: 'role', type: 'VARCHAR(50)', constraints: undefined }
                    ],
                    primaryKey: ['employee_id', 'project_id'],
                    foreignKeys: [
                        {
                            columns: ['employee_id'],
                            referencesColumns: ['employee_id'],
                            referencesTable: 'Employees'
                        },
                        {
                            columns: ['project_id'],
                            referencesColumns: ['project_id'],
                            referencesTable: 'Projects'
                        }
                    ]
                }
            ]
        });
    });
});
