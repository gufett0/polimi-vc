import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";

describe("Verifier Contract", function () {
  let verifier: any;

  // Deploy the Verifier contract before running the tests
  before(async function () {
    const Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();  // No need to call deployed() separately
  });

  it("Should verify the proof using actual proof.json and public.json", async function () {
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

    // Call the verifier's verifyProof function with the formatted inputs
    const result = await verifier.verifyProof(proof_a, proof_b, proof_c, input);

    // Assert that the proof is valid
    expect(result).to.be.true;
  });
});



