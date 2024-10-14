import { createVP } from '../../vc/create-vp';
import { verifyVP } from '../../vc/verify-vp';

async function testVPProcess() {
  // Crea la Verifiable Presentation (VP)
  const vp = await createVP();

  // Verifica la Verifiable Presentation (VP)
  const result = await verifyVP(vp);
  console.log('Esito finale della verifica della VP:', result);
}

// Esegui il processo di test
testVPProcess();