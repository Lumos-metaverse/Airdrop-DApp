const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat");
const data  = require("../gen_files/merkleproof.json")
const userDetails =  require("../gen_files/claimlist.json");


async function main() {

  ///DEPLOYING LUMOS TOKEN
  const Lumostoken = await ethers.deployContract("LumosToken");
  await Lumostoken.waitForDeployment();

  console.log(`Lumostoken contract is deployed to ${Lumostoken.target}`);
  
  //DEPLOYING AIRDROP CONTRACT
  const Airdrop = await ethers.deployContract("Airdrop", [Lumostoken.target]);
  await Airdrop.waitForDeployment();

  console.log(`Airdrop contract is deployed to ${Airdrop.target}`);

  //INTERACTION WITH LUMOS TOKEN CONTRACT TO TRANSFER TOKENS TO THE AIRDROP CONTRACT
  const lumosInteract = await ethers.getContractAt("LumosToken", Lumostoken.target);
  const amount = ethers.parseEther("200");
  const mintTokens = await lumosInteract.mint(Airdrop.target, amount);
  await mintTokens.wait();
  
  const contractBal = await lumosInteract.balanceOf(Airdrop.target);

  console.log("Airdrop Contract Balance is", contractBal );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});