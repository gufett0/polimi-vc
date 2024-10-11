import { generateVerifierCircuitInputs } from "../helpers";
import { buildPoseidon } from "circomlibjs";
import { verifyDKIMSignature } from "@zk-email/helpers/dist/dkim";
import { bigIntToChunkedBytes, bytesToBigInt, packedNBytesToString } from "@zk-email/helpers/dist/binary-format";
const path = require("path");
const fs = require("fs");
const snarkjs = require("snarkjs");
const wasm_tester = require("circom_tester").wasm;

describe("Verifier Circuit Test with Proof Generation", function () {
  jest.setTimeout(60 * 60 * 1000); // 10 minuti

  let rawEmail: Buffer;
  let circuit: any;

  const CIRCUIT_NAME = "main"; // Assicurati che il nome del circuito sia corretto
  const BUILD_DIR = path.join(__dirname, "../build");
  const OUTPUT_DIR = path.join(__dirname, "../proofs");

  beforeAll(async () => {
    rawEmail = fs.readFileSync(
      path.join(__dirname, "./emls/email-test.eml"), // Percorso corretto del file di test
      "utf8"
    );

    circuit = await wasm_tester(path.join(__dirname, "../src/main.circom"), {
      recompile: true,
      output: path.join(__dirname, "../build/output"),
      include: [path.join(__dirname, "../node_modules"), path.join(__dirname, "../../../node_modules")],
    });

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
    }
  });

  async function testWithEmail() {
    // Genera gli input per il circuito a partire dal file email
    const ethereumAddress = "0x3773fd7b2a9CF6FF3E3EfD82Bd30536E11e83b6f"; 
    const circuitInputs = await generateVerifierCircuitInputs(rawEmail, ethereumAddress);

    console.log("Circuit Inputs:", circuitInputs);
    // Calcola il witness
    const witness = await circuit.calculateWitness(circuitInputs);
    console.log("Witness calculated");
    await circuit.checkConstraints(witness);
    console.log("Costraint checked");

    const dkimResult = await verifyDKIMSignature(rawEmail, "polimi.it");
    const poseidon = await buildPoseidon();
    const pubkeyChunked = bigIntToChunkedBytes(dkimResult.publicKey, 242, 9);
    const hash = poseidon(pubkeyChunked);

    // Verify the name is correctly extracted and packed form email body
    const nameInEmailBytes = new TextEncoder().encode("FRANCESCO CARBONE ").reverse(); // Circuit pack in reverse order
    expect(witness[1]).toEqual(bytesToBigInt(nameInEmailBytes));
    console.log("Name checked");

    // Verify the date is correctly extracted and packed form email body
    const data = new TextEncoder().encode("Wed, 3 May 2023 18:35:03 +0200 ").reverse(); // Circuit pack in reverse order
    expect(witness[2]).toEqual(bytesToBigInt(data));
    console.log("Date checked");

    // Verify the amount is correctly extracted and packed form email body
    const importo = new TextEncoder().encode("1065").reverse(); // Circuit pack in reverse order
    expect(witness[3]).toEqual(bytesToBigInt(importo));
    console.log("Amount checked");

    // Verify the matricola is correctly extracted and packed form email body
    const matricola = new TextEncoder().encode("10834998").reverse(); // Circuit pack in reverse order
    expect(witness[4]).toEqual(bytesToBigInt(matricola));
    console.log("Matricola checked");
    
    // Assert pubkey hash
    expect(witness[5]).toEqual(poseidon.F.toObject(hash));
    console.log("Pubkey hash checked");

    // Verify the from field is correctly extracted and packed form email body
    const from = new TextEncoder().encode("messaggi.automatici@polimi.it").reverse(); // Circuit pack in reverse order
    expect(witness[6]).toEqual(bytesToBigInt(from));
    console.log("From address checked");

    // Check address public input
    expect(witness[7]).toEqual(BigInt(ethereumAddress));

    // Genera la prova e verifica la validità
    const wasm = fs.readFileSync(
      path.join(BUILD_DIR, `${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm`)
    );
    const wc = require(path.join(BUILD_DIR, `${CIRCUIT_NAME}_js/witness_calculator.js`));
    const witnessCalculator = await wc(wasm);
    const buff = await witnessCalculator.calculateWTNSBin(circuitInputs, 0);
    fs.writeFileSync(path.join(OUTPUT_DIR, `input.wtns`), buff);

    const { proof, publicSignals } = await snarkjs.groth16.prove(
      path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`),
      path.join(OUTPUT_DIR, `input.wtns`)
    );

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `proof.json`),
      JSON.stringify(proof, null, 2)
    );
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `public.json`),
      JSON.stringify(publicSignals, null, 2)
    );

    const vkey = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, `artifacts/${CIRCUIT_NAME}.vkey.json`)).toString());
    const proofVerified = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    expect(proofVerified).toBe(true);
  }

  // Esegue il test con l'email di input
  it(`should validate email and generate proof`, async function () {
    await testWithEmail();
  });
});
