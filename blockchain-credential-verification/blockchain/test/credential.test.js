import { expect } from "chai";
import hre from "hardhat";

describe("CredentialVerification", function () {
  let credentialContract;
  let owner;
  let institution;
  let student;
  
  beforeEach(async function () {
    [owner, institution, student] = await hre.ethers.getSigners();
    
    const CredentialVerification = await hre.ethers.getContractFactory("CredentialVerification");
    credentialContract = await CredentialVerification.deploy();
    
    // Add institution as issuer
    await credentialContract.addIssuer(institution.address);
  });

  it("Should properly initialize with roles", async function () {
    const DEFAULT_ADMIN_ROLE = await credentialContract.DEFAULT_ADMIN_ROLE();
    const ISSUER_ROLE = await credentialContract.ISSUER_ROLE();
    
    expect(await credentialContract.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    expect(await credentialContract.hasRole(ISSUER_ROLE, institution.address)).to.be.true;
    expect(await credentialContract.hasRole(ISSUER_ROLE, student.address)).to.be.false;
  });

  it("Should issue a new credential by an institution", async function () {
    const tx = await credentialContract.connect(institution).issueCredential(
      "CERT-123", "John Doe", "STU-001", "BSc Computer Science", "MIT", "QmHash", 123456, 0 
    );
    
    await expect(tx).to.emit(credentialContract, "CredentialIssued")
      .withArgs("CERT-123", "STU-001", institution.address);
      
    const [cred, isValid] = await credentialContract.verifyCredential("CERT-123");
    expect(cred.studentName).to.equal("John Doe");
    expect(isValid).to.be.true;
  });

  it("Should prevent non-issuers from issuing credentials", async function () {
    await expect(
      credentialContract.connect(student).issueCredential(
        "CERT-124", "Jane Doe", "STU-002", "BA", "Harvard", "hash", 123, 0
      )
    ).to.be.revertedWithCustomError(credentialContract, "AccessControlUnauthorizedAccount");
  });

  it("Should revoke a credential successfully", async function () {
    await credentialContract.connect(institution).issueCredential(
      "CERT-125", "Alice", "STU-003", "MBA", "Stanford", "hash", 123, 0
    );
    
    const tx = await credentialContract.connect(institution).revokeCredential("CERT-125");
    
    await expect(tx).to.emit(credentialContract, "CredentialRevoked")
      .withArgs("CERT-125", institution.address);
      
    const [cred, isValid] = await credentialContract.verifyCredential("CERT-125");
    expect(cred.isRevoked).to.be.true;
    expect(isValid).to.be.false;
  });
});
