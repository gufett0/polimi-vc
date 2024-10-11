// @ts-ignore
import { zKey } from "snarkjs";
import https from "https";
import fs from "fs";
import path from "path";
import pako from "pako";

// ENV Variables
let { ZKEY_ENTROPY, ZKEY_BEACON, SILENT } = process.env;
if (ZKEY_ENTROPY == null) {
  log("No entropy provided, using `dev`");
  ZKEY_ENTROPY = "dev";
}
if (ZKEY_BEACON == null) {
  ZKEY_BEACON =
    "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f";
  log("No ZKEY_BEACON provided, using default");
}

// Constants
const CIRCUIT_NAME = "main";
const BUILD_DIR = path.join(__dirname, "../build");
const PHASE1_URL =
  "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_22.ptau";
const PHASE1_PATH = path.join(BUILD_DIR, "powersOfTau28_hez_final_22.ptau");
const ARTIFACTS_DIR = path.join(BUILD_DIR, 'artifacts');
const SOLIDITY_TEMPLATE = path.join(
  require.resolve("snarkjs"),
  "../../templates/verifier_groth16.sol.ejs"
);
const SOLIDITY_VERIFIER_PATH = path.join(
  __dirname,
  "./Verifier.sol"
);
const zKeyPath = path.join(
    BUILD_DIR,
    "main.zkey"
  );

  console.log(zKeyPath)


function log(...message: any) {
  if (!SILENT) {
    console.log(...message);
  }
}

async function myExport() {
  // Solidity verifier
  const templates = {
    groth16: fs.readFileSync(SOLIDITY_TEMPLATE, "utf8"),
  };
  const code = await zKey.exportSolidityVerifier(zKeyPath, templates, console);
  fs.writeFileSync(SOLIDITY_VERIFIER_PATH, code);
  log(`✓ Solidity verifier exported - ${SOLIDITY_VERIFIER_PATH}`);

  // Cleanup
  ["", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"].forEach((suffix) => {
    if (fs.existsSync(zKeyPath + ".step1" + suffix))
      fs.unlinkSync(zKeyPath + ".step1" + suffix);
    if (fs.existsSync(zKeyPath + ".step2" + suffix))
      fs.unlinkSync(zKeyPath + ".step2" + suffix);
  });

}

myExport();