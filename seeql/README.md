# seeql README

SeeQL is an extension meant to help users when it comes to working with SQL on Visual Studio Code. Overall, it’s meant to help users' overall quality of life when it comes to working with it. Through visualization, helping build SQL queries, and simplifying issues that come with working with SQL. Issues like making up your own SQL statements, knowing if you have the expected output, and visualizing in general. SQL, at times, feels very difficult to work with. We want our extension to make it feel as simple as possible for the user.

## Features
### OpenDB:
- Opens a .db file to run querries
- On success, prompts button left with open DB
  
![OpenDb](https://github.com/user-attachments/assets/d2f46ef4-ebaf-448b-a850-346abb6017bd)

### RunQuerry:
- Requires a DB to be opened by OpenDB command
- Requires user to write a sql statment inside sql file
- On click run querry, table appear with stats
  
![Untitled design](https://github.com/user-attachments/assets/101095d3-358a-4217-9bb0-637da8ddb78f)

### CreateERDiagram
- Creates a E/R diagram given a sql file with valid querry

![Er](https://github.com/user-attachments/assets/2d6bdae5-aef5-4c68-a659-32790cfab2ff)

### CreateRelationAlgebra
- Creates a relation algerbra diagram given a sql file with valid querry
  
  ![RAdemo](https://github.com/user-attachments/assets/15590a33-5a54-40d3-88a6-8263a9ae510b)

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
