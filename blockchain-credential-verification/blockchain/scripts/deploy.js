import hre from "hardhat";

async function main() {
  const CredentialVerification = await hre.ethers.getContractFactory("CredentialVerification");
  const contract = await CredentialVerification.deploy();

  await contract.waitForDeployment();

  console.log(`CredentialVerification deployed to: ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
