## Description:

SeeQL aims to simplify working with sql and help better vizualize a database inside VS code. In the current iteration, users can open up a data that they are working in and run sql statments that will show the results plus number of rows and columns returned in a seprate window inside VS code. The software can also generate E/R diagrams from Create tables to show relations between tables as well as Relational Algebra for users who are starting to learning SQL and people who need relationship visualized.

## Installation:

To install SeeQL, you can go to the VS code extensions store search 'SeeQL' and click install. If encountering problems, try npm install and npm install sqlite3.

## Run the software:

Simply install from the VSCode extension store. Commands should appear in VsCode Command Line

## How to use software:
When it comes to using the software, the user can access any of the visualization features by using the vscode command line. After the user installs, it's just a matter of selecting which one and it should work. Then you select the corresponding file to that command. As long as it meets the requirements.

Requirements to Command Lines

SeeQL: Create a Diagram of a Create SQL Statement: For this you need an SQL statement, that holds Create Tables in the file. If there are no create tables found nothing will be outputted.

SeeQL: Create a Relational Algebra Diagram: For this you need a general non-nested SQL SELECT query. If the query is unsupported (is nested, or incorrect syntax), the webview displays a corresponding message.

SeeQL: Open Database: For this to function, you need a db file. All this does is it takes in a file.

Running Queries: A button pops up above valid SQL statements. Simply click it and a webview should pop up of the SQL query.

# How to Report a Bug
If you encounter a bug while using SeeQL, please report it through our GitHub issue tracker:
[Issue Tracker](https://github.com/Taipods/SeeQL/issues)

Each issue should have its own bug report to ensure a smooth debugging and fixing process.

## Steps to Follow
1. Ensure the issue is reproducible:
     - If you can consistently reproduce a bug, include the exact steps.
     - If it occurs sporadically, provide any patterns or conditions where it happens.
     - If you cannot reproduce the issue, provide as much context as possible.
2. Check for existing reports: search for similar issues before submitting a new report to avoid duplicates.
3. Use the latest version: verify that the bug still occurs in the most recent build of the software.
4. Gather necessary information:
     - Provide system details (OS, software version, etc.).
     - Identify any settings, extensions, or configurations that might contribute to the issue.
5. Submit a new bug report:
     - Clearly summarize the issue.
     - Include precise steps to reproduce, expected results, and actual results.
     - Attach relevant logs, screenshots, or other supporting information.

## Writing a Clear Bug Report
### Summary
How would you describe the bug in ~10 words? The summary should clearly state the problem, not a proposed solution.

**Good:** "App crashes when saving a file with a long name."

**Bad:** "Saving doesn't work"

### Steps to Reproduce
A clear, step-by-step guide for reproducing the issue.

**Example:**
1. Open the application
2. Click "File" -> "Save As"
3. Enter a filename longer than 255 characters
4. Click "Save"

### Expected Results
What should happen if the bug were not present?

**Example:** The file should save successfully.

### Actual Results
What actually happened?

**Example:** The application crashes immediately.

### Additional Information
Depending on the type of issue, include:
- Crash reports or stack traces (if the application crashes)
- Performance bugs (if the issue involves slow response times)
- Screenshots or screen recordings (if visual glitches occur)
- Configuration details (if the bug only happends with specific settings)

### Finding the Right Category
When submitting the bug, select the most appropriate category to help direct it to the right team. If unsure, choose "General.

# Known Bugs and Limitations
The following known bugs and limitations are currently being tracked. Please check our [Github Issues](https://github.com/Taipods/SeeQL/issues) for updates.

- **SQLite Installation Issues:** Some users experience issues with `sqlite3` dependencies. Running `npm install sqlite3` before compilation usually resolves this.
- **ER Diagram Rendering Delay:** When processing large SQL files, the ER diagram generation may take longer than expected.
- **Limited Support for Complex Queries:** The relational algebra visualization may not work correctly for highly nested queries.
- **File Format Restrictions:** Currently, only `.sql` files are supported for parsing; other formats like `.txt` will not work.

If you find a bug that is not listed here, please report it through the _How to Report a Bug_ section above.
