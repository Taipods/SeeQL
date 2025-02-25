## Source Code:

All Source Code for this software lies inside Seeql/seeql/src.

## Directory Layout:
-> Assuming inside seeql
  - package.json contains declarations of commands
  
-> Assuming inside seeql/src
  - extension.ts is where all our register commands are.
  - test directory is all our tests + testing files. 
  - commands directory is all the logic behind the E/R + Relational commands passed in extension.ts
  - sqlite is logic to build pull DB + run query command.
  - parser contains our own produce regex parser.

## How to build the software:

To build the software follow these steps

### Steps 

1. Clone the SeeQL code from https://github.com/Taipods/SeeQL.git
2. Run npm install
3. Run npm install sqlite3 (Run this just in case to avoid OS differeces error)
4. Run npm run compile (Tentative: Had issues when this wasn't run haven't tested)

## Testing:
#### How to test the software
Prerequisites:
Ensure you have the following installed:
1. Node.js
2. npm
3. Vs Code

#### Steps
1. Run npm install
2. Run npm install sqlite3
3. Run npm run compile
4. Run npm run test

### How to add new tests
Prerequisites:
1. Node.js
2. VsCode
3. Mocha should come with VsCode
4. File System Access(if using own SQL files to test)

Run npm install and npm install sqlite3 to ensure correctness

### Example Test Case
suite('Name of Command Testing: general name of what you are testing', () => {

    test(Enter specific name of what you are testing here ,() => {

      Enter basic test case here

    });

});

This is for simple unit testing. That's all that's needed. In order to test visually, you'd have to test it by yourself. So far, it's best to simply test out any parsers that were made and ensure data is parsed and processed for diagrams properly.


## Build a Release
To build a release of the software, follow these steps:
1. Update Version Number (manual task)
   Before invoking the build system, update the version number in:
     - The main application source code (`package.json`)
     - Documentation, including `README.md`, and any versioned API references
2. Commit and Tag the Release (manual task)
     - Ensure all code changes are committed to the repository
     - Create a Git tag with the version number
     - Push the tag to the remote repository
3. Run the Build System (automated task)
     - Execute the build command (`npm run build`)
     - The build system should generate the required binaries, executables, or packaged files
4. Perform Sanity Checks (manual task)
   After building the release, perform these checks:
     - Verify that the built artifaccts contain the correct version
     - Run automated tests (`npm test`)
     - Manually test key functionalities, if necessary
     - Ensure no debug lods, test credentials, or sensitive information are included in the build
5. Package and Publish the Release (automated task)
     - Upload the release artifacts to the appropriate platform
     - Deploy to staging or production environments, if applicable
6. Update Documentation and Notify Users (manual task)
     - Update any relevant documentation
     - Announce the release via internal communication channels or public changelogs
