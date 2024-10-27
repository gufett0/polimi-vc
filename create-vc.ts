import { agent } from './setup-agent';
import { VerifiableCredential } from '@veramo/core';
import fs from 'fs';
import path from 'path';
import { bigIntToStringLE } from './helpers/bigIntToString';

// Function to create the student's self-attested VC
export async function createStudentVC() {
  try {
    const publicPath = path.join(__dirname, '../circuits/proofs/public.json');
    const proofPath = path.join(__dirname, '../circuits/proofs/proof.json');

    if (!fs.existsSync(publicPath) || !fs.existsSync(proofPath)) {
      throw new Error('I file public.json o proof.json non esistono nei percorsi specificati.');
    }

    const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    const nome = bigIntToStringLE(BigInt(publicSignals[0]));
    const matricola = bigIntToStringLE(BigInt(publicSignals[3]));
    const data = bigIntToStringLE(BigInt(publicSignals[1]));
    const importo = bigIntToStringLE(BigInt(publicSignals[2]));

    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));

    const userDid = await agent.didManagerGet({ did: 'did:ethr:sepolia' });

    // Self-attested VC for the student
    const studentVC: VerifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: userDid.did }, 
        credentialSubject: {
          id: userDid.did,
          name: nome,
          matricola: matricola,
          date: data,
          amount: importo,
          currency: 'EUR',
        },
      },
      proofFormat: 'jwt', // Using JWT for simplicity
      proof: {
        type: 'zkSNARK',
        proofPurpose: 'assertionMethod',
        created: new Date().toISOString(),
        verificationMethod: userDid.did,
        proofValue: {
          pi_a: proof.pi_a,
          pi_b: proof.pi_b,
          pi_c: proof.pi_c,
          protocol: 'groth16',
          curve: 'bn128',
        },
        publicSignals: publicSignals,
      },
      save: true,
    });

    console.log('Student VC created with JWT:', studentVC);
    return studentVC;
  } catch (error) {
    console.error('Error creating Student VC:', error);
    throw error;
  }
}

// Function to simulate Polimi's VC
export async function createPolimiVC(studentDid: string, email: string, dkimPubKey: string) {
  try {
    const polimiDid = 'did:ethr:sepolia:polimi'; // Simulated Polimi DID

    // Create Polimi's Verifiable Credential
    const polimiVC: VerifiableCredential = await agent.createVerifiableCredential({
      credential: {
        issuer: { id: polimiDid }, 
        credentialSubject: {
          id: studentDid, 
          email: email,
          dkimPubKey: dkimPubKey, 
        },
      },
      proofFormat: 'jwt',
      save: true,
    });

    console.log('Polimi Verifiable Credential created:', polimiVC);
    return polimiVC;
  } catch (error) {
    console.error('Error creating Polimi Verifiable Credential:', error);
    throw error;
  }
}







