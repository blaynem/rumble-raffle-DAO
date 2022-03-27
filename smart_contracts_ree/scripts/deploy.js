const main = async () => {
  const transactionsFactory = await hre.ethers.getContractFactory("Transactions");
  const transactionsContract = await transactionsFactory.deploy();

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();

  const RumblePayments  = await hre.ethers.getContractFactory("RumblePayments");
  const rumblePayments  = await RumblePayments.deploy();

  await transactionsContract.deployed();
  await token.deployed();
  await rumblePayments.deployed();

  console.log("Transactions address: ", transactionsContract.address);
  console.log("Token deployed to:", token.address);
  console.log("RumblePayments deployed to:", rumblePayments.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();