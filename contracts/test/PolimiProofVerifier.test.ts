import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import "@nomiclabs/hardhat-web3";

describe("PolimiProofVerifier Contract", function () {
  // let verifier: any;
  // let dkimRegistry: any;
  let polimiProofVerifier: any;

  // Deploy the contracts before running the tests
  // before(async function () {
  //   const [deployer] = await ethers.getSigners();

  //   const Verifier = await ethers.getContractFactory("Verifier");
  //   verifier = await Verifier.deploy();

  //   const DKIMRegistry = await ethers.getContractFactory("DKIMRegistry");
  //   dkimRegistry = await DKIMRegistry.deploy(deployer.address);

  //   const PolimiProofVerifier = await ethers.getContractFactory("PolimiProofVerifier");
  //   polimiProofVerifier = await PolimiProofVerifier.deploy(verifier.target, dkimRegistry.target);

  //   const pubKeyHash = "0x2dcf82a66187987cd4c8da8ee037815e71dc576598a4414b27b2640df1584566"
    
  //   console.log('Extracted Poseidon Public Key Hash:', pubKeyHash);

  //   const domainName = 'polimi.it';
    
  //   // Call the setDKIMPublicKeyHash function with the calculated hash
  //   await dkimRegistry.setDKIMPublicKeyHash(domainName, pubKeyHash);
  //   console.log(`DKIM Public Key Hash for ${domainName} set successfully.`);
  // });

  it("Should verify the proof and DKIM public key hash using actual proof.json and public.json", async function () {
    const proofPath = "../circuits/proofs/proof.json";
    const publicPath = "../circuits/proofs/public.json";
    // const dkimRegistry_address = "0xb2afc355cfe65b01bae8bfe3d19ec43f3181ffa7";
    // const verifier_address = "0x1cddde3ccc090be32df6045053f1f0b6af6edbe";
    const polimiProofVerifier_address = "0xd2fe476ae23b6a1ec149364c2183e7c43f8af0d0";
    
    polimiProofVerifier = await ethers.getContractAt("PolimiProofVerifier", polimiProofVerifier_address);

    if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath)) {
      throw new Error("Proof or public signal files not found");
    }

    const proof = JSON.parse(fs.readFileSync(proofPath, "utf8"));
    const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf8"));

    const proof_a = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const proof_b = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])]
    ];
    const proof_c = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
    const input = publicSignals.map((signal: string) => BigInt(signal));

    const proof_swapped = [
      proof_a[0], proof_a[1],
      proof_b[0][0], proof_b[0][1], proof_b[1][0], proof_b[1][1],
      proof_c[0], proof_c[1]
    ];

      // Estimate gas for verifyProof
      const gasEstimate = await ethers.provider.estimateGas({
        to: polimiProofVerifier_address,
        data: polimiProofVerifier.interface.encodeFunctionData("verifyProof", [proof_swapped, input])
      });
      console.log("Estimated gas for verifyProof:", gasEstimate.toString());
  
      // Execute the function with the estimated gas limit
      const tx = await polimiProofVerifier.verifyProof(proof_swapped, input, {
        gasLimit: gasEstimate
      });
      // Now call the function and verify it works
      const result = await polimiProofVerifier.verifyProof(proof_swapped, input,{gasLimit: 500000 });
      // Assert that the proof is valid
      expect(result).to.be.true;
    
  });
});

