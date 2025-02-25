## Source Code:

All Source Code for this software lies inside Seeql/seeql/src.

## Directory Layout:
-> Assuming inside seeql
  
-> Assuming inside seeql/src
  - extension.ts is where all our register commands are.
  - test directory is all our tests + testing files. 
  - commands is all the logic behind the commands passed in extension.ts
  - sqlite is logic to build pull DB + run query command.
  - parser contains our own produce regex parser.

## Build:

To build the software follow these steps

### Steps 

1. Clone the SeeQL code from https://github.com/Taipods/SeeQL.git
2. Run npm install
3. Run npm install sqlite3 (Run this just in case to avoid OS differeces error)
4. Run npm run compile (Tentative: Had issues when this wasn't run haven't tested)

## Testing:

Npm run test

## Build a release:

