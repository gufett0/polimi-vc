import { program } from "commander";
import fs from "fs";
import path from "path";
import { generateVerifierCircuitInputs } from "../helpers";
const snarkjs = require("snarkjs");

program
  .requiredOption("--email-file <string>", "Path to email file")
  .requiredOption("--eth-address <string>", "Ethereum address for the circuit")
  .option("--silent", "No console logs");

program.parse();
const args = program.opts();

const CIRCUIT_NAME = "main"; // Assicurati che il nome del circuito sia corretto
const BUILD_DIR = path.join(__dirname, "../build");
const OUTPUT_DIR = path.join(__dirname, "../proofs");

function log(...message: any[]): void {
  if (!args.silent) {
    console.log(...message);
  }
}

const logger = { log, error: log, warn: log, debug: log };

async function generate(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  if (!fs.existsSync(args.emailFile)) {
    throw new Error("--email-file path must be a valid file");
  }

  log("Generating input and proof for:", args.emailFile);

  const rawEmail = Buffer.from(fs.readFileSync(args.emailFile, "utf8"));
  
  // Modifica per utilizzare l'ethereum address al posto di refYear/refMonth
  const circuitInputs = await generateVerifierCircuitInputs(
    rawEmail,
    args.ethAddress // Passa l'indirizzo Ethereum
  );

  log("\n\nGenerated Inputs:", circuitInputs, "\n\n");

  // Scrive gli input nel file input.json
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "input.json"),
    JSON.stringify(circuitInputs, null, 2)
  );
  log("Inputs written to", path.join(OUTPUT_DIR, "input.json"));

  const wasm = fs.readFileSync(
    path.join(BUILD_DIR, `${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm`)
  );
  const wc = require(path.join(
    BUILD_DIR,
    `${CIRCUIT_NAME}_js/witness_calculator.js`
  ));
  const witnessCalculator = await wc(wasm);
  const buff = await witnessCalculator.calculateWTNSBin(circuitInputs, 0);
  fs.writeFileSync(path.join(OUTPUT_DIR, `input.wtns`), buff);

  const { proof, publicSignals } = await snarkjs.groth16.prove(
    path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`),
    path.join(OUTPUT_DIR, `input.wtns`),
    logger
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "proof.json"),
    JSON.stringify(proof, null, 2)
  );
  log("Proof written to", path.join(OUTPUT_DIR, "proof.json"));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "public.json"),
    JSON.stringify(publicSignals, null, 2)
  );
  log("Public Inputs written to", path.join(OUTPUT_DIR, "public.json"));

  const vkey = JSON.parse(
    fs.readFileSync(path.join(BUILD_DIR, `artifacts/${CIRCUIT_NAME}.vkey.json`)).toString()
  );
  const proofVerified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  if (proofVerified) {
    console.log("Proof Verified");
  } else {
    throw new Error("Proof Verification Failed");
  }

  process.exit(0);
}

generate().catch((err) => {
  console.error("Error generating proof", err);
  process.exit(1);
});
