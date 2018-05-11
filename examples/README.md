# Quick Notes
`dotenv` is listed as a dependencies in `package.json`.
If you want to use this, add a `.env` file to the root of this project (same level as this `README.md` file)
and replace the variables to fit your specific config.

```
BIGCHAINDB_API_PATH=https://test.bigchaindb.com/api/v1/
BIGCHAINDB_APP_ID=<your-app-id>
BIGCHAINDB_APP_KEY=<your-app-key>
```

# Usage
`npm install` -> Installs all required dependencies to run these examples.

## Different Examples
**Basic Usage**: Create asset and transfer it to new owner. 
-> `npm start`

**Async/Await Basic Usage**: Basic usage example rewritten with async/await.
-> `npm run basic-async`

**Querying for Assets**: Query for assetdata or metadata.
-> `npm run query-assets`

**Seed/Keypair Functionality**: Create keypair with bip39 library.
-> `npm run seed-func`
