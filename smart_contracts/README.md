# Steps I took to create

1. run `npx hardhat` and choose options
   - This gives `contracts` folder and `hardhat.config.js` files.
2. inside `hardhat.config.js` add `paths` and `networks.hardhat`:
   ```js
   module.exports = {
     paths: {
       artifacts: "./src/artifacts",
     },
     networks: {
       hardhat: {
         chainId: 1337,
       },
     },
   };
   ```
3. Check out `scripts/deploy.ts` for the deploy script. 
4. run `npx hardhat compile`
    - Compiles smart contract into `src/artifacts` directory.
    - We're interested in the `artifacts/contracts/Greeter.json` for the `abi`.
        - This interface is what we import into the app to interact with the contract
5. run `npx hardhat node`
    - Creates local test network and gives us some accounts to test with
    - Keep this node running
6. In another window run `npx hardhat run scripts/deploy.js --network localhost` to deploy to the localhost
   


# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```
