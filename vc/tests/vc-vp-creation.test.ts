import { expect, describe, it } from 'vitest';
import { createStudentVC } from '../create-student-vc';
import { createSimulatedPolimiVC } from '../create-polimi-vc'; 
import { createVerifiablePresentation } from '../create-vp';
import { agent } from '../setup-agent';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

describe('Verifiable Credential Creation', () => {

  it('should create a self-attested Student VC with zkSNARK proof', async () => {
    const studentVC = await createStudentVC();

    // Verifica che il VC esista
    expect(studentVC).to.exist;

    // Recupera e verifica l'indirizzo Ethereum associato al DID
    const privateKey = process.env.KMS_SECRET_KEY as string;
    const wallet = new ethers.Wallet(privateKey);

    const expectedDid = `did:ethr:sepolia:${wallet.address}`;

    // Controlla l'issuer della VC
    expect((studentVC.issuer as any).id).toBe(expectedDid);
    

    // Controlla la presenza dei campi nella subject del VC
    expect(studentVC.credentialSubject).to.have.property('name');
    expect(studentVC.credentialSubject).to.have.property('date');
    expect(studentVC.credentialSubject).to.have.property('amount');
    expect(studentVC.credentialSubject.id).toBe(expectedDid);
  });

  it('should create a Polimi VC with student email and DKIM public key', async () => {
    // Utilizzo dell'indirizzo Ethereum derivato per la verifica del DID dello studente
    const privateKey = process.env.KMS_SECRET_KEY as string;
    const wallet = new ethers.Wallet(privateKey);
    const studentDid = `did:ethr:sepolia:${wallet.address}`;

    const email = 'francesco1.carbone@mail.polimi.it';
    const dkimPubKey = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoInYVAa6hwoFWbqnI4bJ
    vhurEK3KMdc6fARKLoSj/sXKnjNDgqBzUM9y0lb7Oa2Erxzd2hjjZicF7eaVepob
    neZqyqxM1TsrJVJbGsHM6lVeFhDFxACIT5iWbooCyA7o/J/1kD7SR78llaInpabd
    oNCxhhnRfBsoBc1tRV49Q25bWbkQ2EU2wbFyzIBGWzRz0QIplHElxgropOUZqzEG
    rQfLxO/n00IgGWTldurezUdpqwKUA7PFUPVw3G0JovBXOjyPPcn2Nvps/jYsVGul
    QfomMX5pc+Ol6rqOTt9QywIVm5I+CJKyJZq4+Hh2IkuZJyRHRYxBCZTEs5ZQelSQ
    BQIDAQAB
    -----END PUBLIC KEY-----`
    // Crea il VC di Polimi simulato
    const polimiVc = await createSimulatedPolimiVC(studentDid, email, dkimPubKey);
    const polimiVcToken = polimiVc.proof.jwt;
    expect(polimiVcToken).to.exist;

    // Decodifica il token JWT per verificare i campi
    const decodedPolimiVC = jwt.decode(polimiVcToken, { complete: true }) as any;

    // Verifica che l'issuer di Polimi sia corretto
    expect(decodedPolimiVC.payload.issuer).to.equal('did:emaildomain:polimi.it');

    // Verifica il subject del VC di Polimi
    // expect(decodedPolimiVC.payload.credentialSubject.id).to.equal(studentDid);
    expect(decodedPolimiVC.payload.credentialSubject).to.have.property('email', email);
    expect(decodedPolimiVC.payload.credentialSubject).to.have.property('issuer_dkimPubKey', dkimPubKey);
  });
});

describe('Verifiable Presentation Creation', () => {
  it('should create a Verifiable Presentation with Student VC and Polimi VC', async () => {
    const privateKey = process.env.KMS_SECRET_KEY as string;
    const wallet = new ethers.Wallet(privateKey);
    const studentDid = `did:ethr:sepolia:${wallet.address}`;
    const email = 'francesco1.carbone@mail.polimi.it';
    const dkimPubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoInYVAa6hwoFWbqnI4bJ
vhurEK3KMdc6fARKLoSj/sXKnjNDgqBzUM9y0lb7Oa2Erxzd2hjjZicF7eaVepob
neZqyqxM1TsrJVJbGsHM6lVeFhDFxACIT5iWbooCyA7o/J/1kD7SR78llaInpabd
oNCxhhnRfBsoBc1tRV49Q25bWbkQ2EU2wbFyzIBGWzRz0QIplHElxgropOUZqzEG
rQfLxO/n00IgGWTldurezUdpqwKUA7PFUPVw3G0JovBXOjyPPcn2Nvps/jYsVGul
QfomMX5pc+Ol6rqOTt9QywIVm5I+CJKyJZq4+Hh2IkuZJyRHRYxBCZTEs5ZQelSQ
BQIDAQAB
-----END PUBLIC KEY-----`
    // Simulate Polimi VC
    const polimiVcToken = await createSimulatedPolimiVC(studentDid, email, dkimPubKey);

    // Create the student VC
    const studentVC = await createStudentVC();

    // Create the Verifiable Presentation
    const vp = await createVerifiablePresentation(studentDid, studentVC, polimiVcToken);

    expect(vp).toBeDefined();

    // Ensure that verifiableCredential is defined
    const verifiableCredential = vp.verifiableCredential as any[];
    expect(verifiableCredential.length).toBe(2); // Polimi VC + Student VC

    // Cerca il JWT della Student VC utilizzando `credentialSubject.id`
    const studentVCJwt = verifiableCredential.find(vc => vc.credentialSubject?.id === studentDid);
    expect(studentVCJwt).toBeDefined();

   if (studentVCJwt) {
  // Verifica e decodifica il JWT della Student VC
  const verifiedStudentVC = await agent.verifyCredential({ credential: studentVCJwt });
  expect(verifiedStudentVC.verified).toBe(true);

  // Verifica la struttura generale del credentialSubject della Student VC
  expect(studentVCJwt).to.have.property('credentialSubject');
  expect(studentVCJwt.credentialSubject).to.be.an('object');

  // Verifica la presenza di proprietà specifiche nella Student VC
  expect(studentVCJwt.credentialSubject).to.have.property('name', 'FRANCESCO CARBONE');
  expect(studentVCJwt.credentialSubject).to.have.property('date', 'Wed, 3 May 2023 18:35:03 +0200');
  expect(studentVCJwt.credentialSubject).to.have.property('currency', 'EUR');
  // expect(studentVCJwt.credentialSubject).to.have.property('id', studentDid);
  expect(studentVCJwt.credentialSubject).to.have.property('matricola','10834998'); 
  expect(studentVCJwt.credentialSubject).to.have.property('amount', '1065');

  const verifiedVP = await agent.verifyPresentation({
    presentation: vp
  });

  // Verifica che la VP sia autentica e non manomessa
  expect(verifiedVP.verified).toBe(true);
}

  });
});



