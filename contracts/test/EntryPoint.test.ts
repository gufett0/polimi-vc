import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";

describe("PolimiProofVerifier Contract", function () {
  let verifier: any;
  let dkimRegistry: any;
  let polimiProofVerifier: any;

  // Deploy the contracts before running the tests
  before(async function () {
    // Get the default signer (account 0)
    const [deployer] = await ethers.getSigners();

    // Deploy the Verifier contract
    const Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();
    console.log("Verifier deployed at:", verifier.target);

    // Deploy the DKIMRegistry contract with the deployer as signer
    const DKIMRegistry = await ethers.getContractFactory("DKIMRegistry");
    dkimRegistry = await DKIMRegistry.deploy(deployer.address);  // Pass deployer address if needed in the constructor
    console.log("DKIMRegistry deployed at:", dkimRegistry.target);

    // Deploy the PolimiProofVerifier contract, passing the verifier and dkimRegistry addresses
    const PolimiProofVerifier = await ethers.getContractFactory("PolimiProofVerifier");
    polimiProofVerifier = await PolimiProofVerifier.deploy(verifier.target, dkimRegistry.target);
    console.log("PolimiProofVerifier deployed at:", polimiProofVerifier.target);
  });

  it("Should verify the proof and DKIM public key hash using actual proof.json and public.json", async function () {
    // Load the proof and public signals from JSON files
    const proofPath = "../circuits/proofs/proof.json";
    const publicPath = "../circuits/proofs/public.json";

    if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath)) {
      throw new Error("Proof or public signal files not found");
    }

    const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

    // Convert proof values to BigInt format
    const proof_a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    
    // Swap the elements in each subarray of proof_b
    const proof_b = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])], // Swapped order
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]  // Swapped order
    ];
    
    const proof_c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];

    // Convert public signals to BigInt format
    const input = publicSignals.map((signal: string) => BigInt(signal));

    // Insert the DKIM public key hash into the DKIMRegistry
    const domain = "polimi.it";
    const dkimPublicKeyHash = input[0]; // Assuming this comes from signals[0]

    // Pad the DKIM public key hash (to 32 bytes length)
    const paddedDkimPublicKeyHash = ethers.zeroPadBytes(ethers.toBeHex(dkimPublicKeyHash), 32); 
    await dkimRegistry.setDKIMPublicKeyHash(domain, paddedDkimPublicKeyHash);

    // Call the verifyProof function of PolimiProofVerifier with the formatted inputs
    const result = await polimiProofVerifier.verifyProof(
      [proof_a[0], proof_a[1]],
      [[proof_b[0][0], proof_b[0][1]], [proof_b[1][0], proof_b[1][1]]],
      [proof_c[0], proof_c[1]],
      input
    );

    // Assert that the proof is valid
    expect(result).to.be.true;
  });
});
