const { expect } = require("chai");
const { parseSQLForERDiagram } = require("../path/to/your/module"); // Adjust path accordingly

describe("parseSQLForERDiagram", function () {
    it("should parse a simple CREATE TABLE statement correctly", function () {
        const sqlText = `
            CREATE TABLE Users (
                id INT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE
            );
        `;

        const result = parseSQLForERDiagram(sqlText);

        expect(result).to.have.property("tables").that.is.an("array").with.lengthOf(1);
        const table = result.tables[0];

        expect(table.name).to.equal("Users");
        expect(table.primaryKey).to.deep.equal(["id"]);
        expect(table.columns).to.deep.include({ name: "name", type: "VARCHAR(100)", constraints: ["NOT NULL"] });
        expect(table.columns).to.deep.include({ name: "email", type: "VARCHAR(255)", constraints: ["UNIQUE"] });
    });
});