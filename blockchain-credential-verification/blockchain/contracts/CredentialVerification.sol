// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CredentialVerification is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Credential {
        string credentialId;
        string studentName;
        string studentId;
        string degree;
        string institution;
        string ipfsHash;
        uint256 issueDate;
        uint256 expiryDate;
        address issuedBy;
        bool isRevoked;
    }

    mapping(string => Credential) private credentials;
    // Map studentId to an array of their credential IDs
    mapping(string => string[]) private studentCredentials;
    
    uint256 private totalCredentials;

    event CredentialIssued(string indexed credentialId, string studentId, address indexed issuedBy);
    event CredentialRevoked(string indexed credentialId, address indexed revokedBy);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    function issueCredential(
        string memory _credentialId,
        string memory _studentName,
        string memory _studentId,
        string memory _degree,
        string memory _institution,
        string memory _ipfsHash,
        uint256 _issueDate,
        uint256 _expiryDate
    ) external onlyRole(ISSUER_ROLE) {
        require(bytes(credentials[_credentialId].credentialId).length == 0, "Credential already exists");

        credentials[_credentialId] = Credential({
            credentialId: _credentialId,
            studentName: _studentName,
            studentId: _studentId,
            degree: _degree,
            institution: _institution,
            ipfsHash: _ipfsHash,
            issueDate: _issueDate,
            expiryDate: _expiryDate,
            issuedBy: msg.sender,
            isRevoked: false
        });

        studentCredentials[_studentId].push(_credentialId);
        totalCredentials++;

        emit CredentialIssued(_credentialId, _studentId, msg.sender);
    }

    function verifyCredential(string memory _credentialId) external view returns (Credential memory, bool isValid) {
        Credential memory cred = credentials[_credentialId];
        bool exists = bytes(cred.credentialId).length > 0;
        bool expired = cred.expiryDate > 0 && block.timestamp > cred.expiryDate;
        bool valid = exists && !cred.isRevoked && !expired;
        
        return (cred, valid);
    }

    function revokeCredential(string memory _credentialId) external onlyRole(ISSUER_ROLE) {
        require(bytes(credentials[_credentialId].credentialId).length > 0, "Credential does not exist");
        require(!credentials[_credentialId].isRevoked, "Already revoked");

        credentials[_credentialId].isRevoked = true;
        emit CredentialRevoked(_credentialId, msg.sender);
    }

    function getStudentCredentials(string memory _studentId) external view returns (string[] memory) {
        return studentCredentials[_studentId];
    }

    function addIssuer(address issuer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ISSUER_ROLE, issuer);
    }

    function getTotalCredentials() external view returns (uint256) {
        return totalCredentials;
    }
}
