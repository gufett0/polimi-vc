import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";

describe("PolimiProofVerifier Contract", function () {
  let verifier: any;
  let polimiProofVerifier: any;
  let dkimRegistry: any;

  before(async function () {
    // Deploy the Verifier contract
    const Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();

    // Deploy a mock DKIMRegistry contract (assuming it's simple)
    const DKIMRegistry = await ethers.getContractFactory("DKIMRegistry");
    dkimRegistry = await DKIMRegistry.deploy();
    await dkimRegistry.waitForDeployment();

    // Deploy the PolimiProofVerifier contract using Verifier and DKIMRegistry
    const PolimiProofVerifier = await ethers.getContractFactory("PolimiProofVerifier");
    polimiProofVerifier = await PolimiProofVerifier.deploy(verifier.getAddress(), dkimRegistry.getAddress());
    await polimiProofVerifier.waitForDeployment();
  });

  function toHex32(value: BigInt): string {
    // Convert the value to a 32-byte hex string (64 characters), prefixed with '0x'
    let hex = value.toString(16);
    while (hex.length < 64) {
      hex = '0' + hex; // Add leading zeros until the string is 64 characters
    }
    return '0x' + hex;
  }

  it("Should verify the proof using actual proof.json and public.json", async function () {
    // Ensure the proof and public signals files exist
    const proofPath = "../../packages/circuits/proofs/proof.json";
    const publicPath = "../../packages/circuits/proofs/public.json";

    if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath)) {
      throw new Error("Proof or public signal files not found");
    }

    const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

    // Convert proof values to 32-byte hex format
    const a = [toHex32(BigInt(proof.pi_a[0])), toHex32(BigInt(proof.pi_a[1]))];
    const b = [
      [toHex32(BigInt(proof.pi_b[0][0])), toHex32(BigInt(proof.pi_b[0][1]))],
      [toHex32(BigInt(proof.pi_b[1][0])), toHex32(BigInt(proof.pi_b[1][1]))]
    ];
    const c = [toHex32(BigInt(proof.pi_c[0])), toHex32(BigInt(proof.pi_c[1]))];

    // Convert public signals to 32-byte hex format
    const input = publicSignals.map((signal: string) => toHex32(BigInt(signal)));

    // Log to verify formatting
    console.log("Hex A:", a);
    console.log("Hex B:", b);
    console.log("Hex C:", c);
    console.log("Hex Public Signals:", input);

    // Call the PolimiProofVerifier's verifyProof function with the correctly formatted hexadecimal arguments
    const result = await polimiProofVerifier.verifyProof(a, b, c, input);

    // Assert the verification result
    expect(result).to.be.true;
  });
});
