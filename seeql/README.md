# seeql README

SeeQL is an extension meant to help users when it comes to working with SQL on Visual Studio Code. Overall, it’s meant to help users' overall quality of life when it comes to working with it. Through visualization, helping build SQL queries, and simplifying issues that come with working with SQL. Issues like making up your own SQL statements, knowing if you have the expected output, and visualizing in general. SQL, at times, feels very difficult to work with. We want our extension to make it feel as simple as possible for the user.

## How to use system
Steps:
1. Open Command Line

![Alt text](seeql/media/Images/Step1.png)

2. Find any SeeQL Command Lines

![Alt text](seeql/media/Images/Step2.png)

3. Select any single one command line
4. Choose a related SeeQl file to that command line. Refer to command lines below for reference of that 

5. Once selected, visualization of that SQL file should be up whether Er Diagram, Relational Algebra, etc.

![Alt text](seeql/media/Images/Step4.png)
## Specific commands demo

### OpenDB:
- Opens a .db file to run querries
- On success, prompts button left with open DB

![OpenDb](https://github.com/user-attachments/assets/d2f46ef4-ebaf-448b-a850-346abb6017bd)

### RunQuery:
- Requires a DB to be opened by OpenDB command
- Requires user to write a sql statment inside sql file
- On click run querry, table appear with stats

![Untitled design](https://github.com/user-attachments/assets/101095d3-358a-4217-9bb0-637da8ddb78f)

### CreateERDiagram
- Creates a E/R diagram given a sql file with valid query
- Before running command, have valid folder open in vscode file explorer holding related SQL Create Tables
- DISCLAIMER: DO NOT PUT INLINE COMMENTS IN SQL STATEMENTS. Due to custom SQL parser for this, we cannot have inline comments for this or any sort of comments. Keep it as barebones as possible.

![ergif](https://github.com/user-attachments/assets/96c9693a-c864-4f7a-8f70-48595e57d67f)

### CreateRelationalAlgebra
- Creates a relatioal algerbra diagram given a sql file with valid query
- Before running command, have valid folder open in vscode file explorer holding related SQL Queries

 ![createRelationalGif](https://github.com/user-attachments/assets/7c0076b4-a387-45b0-84af-c292c827d48d)

### Connect to CloudBase
- Connect to Azure
- Enter your Azure SQL Server
- Enter Azure SQL Username
- Enter password
- Enter Azure SQL Database Name

### Create Database from CSV/SQL File
- Select a CSV File
- Then rename the db file and that's it

![createdb](https://github.com/user-attachments/assets/0ee96726-3479-4da7-862e-758db493f97f)

### GenerateSQLQuery (WIP + Dev excluseive for time being)
- *Requires you to get api key from https://mistral.ai/*
- requires api key to be put inside of .env
- Generates SQL queries based on a user-provided natural language description
- Analyzes the connected database's schema to generate context-aware SQL queries
- Allows direct execution by pasting the generated query into an SQL file and running it
  
![Ai](https://github.com/user-attachments/assets/b33daaca-a689-4699-aadf-7d074d2bd5d3)

## Requirements

N/A

## Extension Settings

N/A

## Known Issues

- *Using Create DB twice on the same CSV Causes empty DB*
- *database structure visulizer tabs duplicates columns name if table is empty*

## Release Notes

First release of SeeQL

### 1.0.0

Initial release of SeeQL

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

**Enjoy!**
