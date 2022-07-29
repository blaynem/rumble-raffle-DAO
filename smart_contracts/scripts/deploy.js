// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract factory
  // const RumbleRaffle = await hre.ethers.getContractFactory('RumbleRaffle');
  const RumbleBeta = await hre.ethers.getContractFactory('RumbleBeta');
  
  // We get the contract to deploy
  // const rumbleRaffle = await RumbleRaffle.deploy();
  const token = await RumbleBeta.deploy(1000000000);
  
  // We wait for it to deploy
  // await rumbleRaffle.deployed();
  await token.deployed();
  
  // console.log("RumbleRaffle deployed to:", rumbleRaffle.address);
  console.log("RumbleBeta Token deployed to:", token.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
