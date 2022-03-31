const { expect } = require("chai");
const { ethers } = require("hardhat");



describe('RumbleRaffle', () => {
  let raffleContract;
  let hardhatToken;
  let hardhatToken2;
  let owner;
  let addr1;
  let addr2;
  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    RumbleRaffle = await ethers.getContractFactory("RumbleRaffle");
    Token = await ethers.getContractFactory("Token");

    [owner, addr1, addr2] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    raffleContract = await RumbleRaffle.deploy();
    hardhatToken = await Token.deploy();
    hardhatToken2 = await Token.deploy();
  });
  it('should set the right owner', async () => {
    expect(await raffleContract.owner()).to.equal(owner.address);
  });

  it("Should emit the EntryFeePaid event on payment", async function () {
    // The contract wallet should be empty
    expect(await hardhatToken.balanceOf(raffleContract.address)).to.eq('0')
    // need to approve the tx first
    const approveContractTx = await hardhatToken.approve(raffleContract.address, 15);
    const approveContractTx2 = await hardhatToken2.approve(raffleContract.address, 30);

    await approveContractTx.wait();
    await approveContractTx2.wait();

    // pay the entry fee
    const payEntryFeeTx = await raffleContract.payEntryFee(hardhatToken.address, 12);
    const payEntryFeeTx2 = await raffleContract.payEntryFee(hardhatToken2.address, 30);

    // wait until the transaction is mined
    const receipt = await payEntryFeeTx.wait();
    const receipt2 = await payEntryFeeTx2.wait();

    // Check that the event data is correct
    expect(receipt.events[2].event).to.eq('EntryFeePaid')
    const args = receipt.events[2].args;
    expect(args[0]).to.equal(owner.address)
    expect(args[1]).to.equal(hardhatToken.address)
    expect(args[2]).to.equal("12")

    expect(receipt2.events[2].event).to.eq('EntryFeePaid')
    const args2 = receipt2.events[2].args;
    expect(args2[0]).to.equal(owner.address)
    expect(args2[1]).to.equal(hardhatToken2.address)
    expect(args2[2]).to.equal("30")

    // Contract should get paid
    expect(await hardhatToken.balanceOf(raffleContract.address)).to.eq('12')
    expect(await hardhatToken2.balanceOf(raffleContract.address)).to.eq('30')
    // Check that the token balance got updated correctly
    expect(await raffleContract.getTokenBalance(hardhatToken.address)).to.eq('12')
    expect(await raffleContract.getTokenBalance(hardhatToken2.address)).to.eq('30')

    // Get all the token balances
    const [balance1, balance2] = await raffleContract.getAllTokenBalances()
    // Check token 1
    expect(balance1[0]).to.eq(hardhatToken.address);
    expect(balance1[1]).to.eq("Brain");
    expect(balance1[2]).to.eq("BRN");
    expect(balance1[3]).to.eq("12");
    // Check token 2
    expect(balance2[0]).to.eq(hardhatToken2.address);
    expect(balance2[1]).to.eq("Brain");
    expect(balance2[2]).to.eq("BRN");
    expect(balance2[3]).to.eq("30");
  });

  describe('withdrawTokenBalance', () => {
    it('limits withdraws to owner', async () => {
      // Attempt to withdraw when we're not the owner of the contract. 
      await expect(
        raffleContract.connect(addr1).withdrawTokenBalance(hardhatToken.address, "30")
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })

    it('errors if not enough balance', async () => {
      // Attempt to withdraw more than we have
      await expect(
        raffleContract.withdrawTokenBalance(hardhatToken.address, "30")
      ).to.be.revertedWith('No balance for this token');
    });

    it('can withdraw if there is enough of a balance', async () => {
      // Approve the tx
      const approveContractTx = await hardhatToken.approve(raffleContract.address, 30);
      await approveContractTx.wait();

      // Pay an entry fee
      const payEntryFeeTx = await raffleContract.payEntryFee(hardhatToken.address, 30);
      payEntryFeeTx.wait();

      // Withdraw a certain amount
      const withdrawTx = await raffleContract.withdrawTokenBalance(hardhatToken.address, "15")
      const receipt = await withdrawTx.wait();

      expect(receipt.events[1].event).to.eq('WithdrawBalance')
      const args = receipt.events[1].args;
      expect(args[0]).to.equal(owner.address)
      expect(args[1]).to.equal(hardhatToken.address)
      expect(args[2]).to.equal("15")
    })
  });

  describe('payoutPrizes', () => {
    it('handles payout of prizes', async () => {
      // Transfer the initial tokens to the other addresses so they have money to spend
      const transfer1 = await hardhatToken.transfer(addr1.address, 100);
      const transfer2 = await hardhatToken.transfer(addr2.address, 100);
      // wait for the transfer to approve
      await transfer1.wait();
      await transfer2.wait();
      // Approve all
      const approveOwner = await hardhatToken.approve(raffleContract.address, 30);
      const approveAddr1 = await hardhatToken.connect(addr1).approve(raffleContract.address, 30);
      const approveAddr2 = await hardhatToken.connect(addr2).approve(raffleContract.address, 30);
      // Wait for blocks to mint
      await approveOwner.wait();
      await approveAddr1.wait();
      await approveAddr2.wait();

      // Pay all fees
      const payEntryOwner = await raffleContract.payEntryFee(hardhatToken.address, 30);
      const payEntryAddr1 = await raffleContract.connect(addr1).payEntryFee(hardhatToken.address, 30);
      const payEntryAddr2 = await raffleContract.connect(addr2).payEntryFee(hardhatToken.address, 30);
      // wait for blocks to mint
      await payEntryOwner.wait();
      await payEntryAddr1.wait();
      await payEntryAddr2.wait();

      expect(await raffleContract.getTokenBalance(hardhatToken.address)).to.eq('90')

      const paymentAddr = [addr1.address, addr2.address];
      const paymentAmt = ['70', '20'];
      
      const payoutPrize = await raffleContract.payoutPrizes(paymentAddr, paymentAmt, hardhatToken.address);
      const payoutReceipt = await payoutPrize.wait();

      // event 0 and 2 are the erc20s transfer event
      const payoutAddrEvent1 = payoutReceipt.events[1];
      const payoutAddrEvent2 = payoutReceipt.events[3];

      // Check prizePayout for first address
      expect(payoutAddrEvent1.event).to.eq('PrizePayout')
      const args1 = payoutAddrEvent1.args;
      expect(args1[0]).to.equal(addr1.address)
      expect(args1[1]).to.equal(hardhatToken.address)
      expect(args1[2]).to.equal("70")

      // Check prizePayout for 2nd address
      expect(payoutAddrEvent2.event).to.eq('PrizePayout')
      const args2 = payoutAddrEvent2.args;
      expect(args2[0]).to.equal(addr2.address)
      expect(args2[1]).to.equal(hardhatToken.address)
      expect(args2[2]).to.equal("20")
    })
    it("only allows the owner to payout prizes", async () => {
      const paymentAddr = [addr1.address, addr2.address];
      const paymentAmt = ['70', '20'];
      // Attempt to payout prize when not the owner.
      await expect(
        raffleContract.connect(addr1).payoutPrizes(paymentAddr, paymentAmt, hardhatToken.address)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    })
    it("will be reverted if there are not enough tokens", async () => {
      const paymentAddr = [addr1.address, addr2.address];
      const paymentAmt = ['70', '20'];
      // Attempt to payout prize when not the owner.
      await expect(
        raffleContract.payoutPrizes(paymentAddr, paymentAmt, hardhatToken.address)
      ).to.be.revertedWith('The token balance for this address is 0.');
    })
    it("will be reverted if the array lengths don't match", async () => {
      await hardhatToken.transfer(raffleContract.address, 100);
      const paymentAddr = [addr1.address, addr2.address];
      // Attempt to payout prize when not the owner.
      await expect(
        raffleContract.payoutPrizes(paymentAddr, [], hardhatToken.address)
      ).to.be.revertedWith('The length of the two arrays should be equal.');
    })
    it("will be reverted if the total requested amount exceed the holdings", async () => {
      await hardhatToken.transfer(raffleContract.address, 10);
      const paymentAddr = [addr1.address, addr2.address];
      const paymentAmt = ['70', '20'];
      // Attempt to payout prize when not the owner.
      await expect(
        raffleContract.payoutPrizes(paymentAddr, paymentAmt, hardhatToken.address)
      ).to.be.revertedWith('Requested payment amount is greater than the current holdings.');
    })
  })
});