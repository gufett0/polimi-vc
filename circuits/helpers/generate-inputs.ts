import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";
import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";

export type IVerifierCircuitInputs = {
  emailHeader: string[];
  emailHeaderLength: string;
  emailBody?: string[] | undefined;
  emailBodyLength?: string | undefined;
  precomputedSHA?: string[] | undefined;
  bodyHashIndex?: string | undefined;
  pubkey: string[];
  signature: string[];
  fromEmailIndex: string;
  nomeIndex: string;
  dataIndex: string;
  importoIndex: string;
  matricolaIndex: string;
  IUVIndex: string;
  address: string;
};

const FROM_SELECTOR = "from:";
const DATE_SELECTOR = "date:";
const NOME_SELECTOR = "Gentile ";
const IUV_SELECTOR = "IUV: ";
const IMPORTO_SELECTOR = "Importo Euro: ";
const MATRICOLA_SELECTOR = "(";

export async function generateVerifierCircuitInputs(
  email: string | Buffer,
  ethereumAddress: string
): Promise<IVerifierCircuitInputs> {
  const emailVerifierInputs = await generateEmailVerifierInputs(email);

  const emailHeaderBuffer = Buffer.from(emailVerifierInputs.emailHeader.map((c) => Number(c)));

  // Gestisci il caso in cui emailBody potrebbe essere undefined
  let emailBodyBuffer: Buffer;
  if (emailVerifierInputs.emailBody) {
    emailBodyBuffer = Buffer.from(emailVerifierInputs.emailBody.map((c) => Number(c)));
  } else {
    throw new Error("Email body is undefined");
  }

  const address = bytesToBigInt(fromHex(ethereumAddress)).toString();

  // Trova l'indice di "from:" nell'header dell'email
  const fromEmailIndex = emailHeaderBuffer.indexOf(Buffer.from(FROM_SELECTOR)) + FROM_SELECTOR.length;

  // Trova l'indice di "date:" nell'header dell'email
  const dataIndex = emailHeaderBuffer.indexOf(Buffer.from(DATE_SELECTOR)) + DATE_SELECTOR.length;

  // Trova l'indice di "Gentile " nel corpo dell'email per il nome
  const nomeIndex = emailBodyBuffer.indexOf(Buffer.from(NOME_SELECTOR)) + NOME_SELECTOR.length;

  // Trova l'indice di "IUV: " nel corpo dell'email
  const IUVIndex = emailBodyBuffer.indexOf(Buffer.from(IUV_SELECTOR)) + IUV_SELECTOR.length;

  // Trova l'indice di "Importo Euro: " nel corpo dell'email
  const importoIndex = emailBodyBuffer.indexOf(Buffer.from(IMPORTO_SELECTOR)) + IMPORTO_SELECTOR.length;

  // Trova l'indice della matricola (presente dopo il nome tra parentesi)
  const matricolaIndex = emailBodyBuffer.indexOf(Buffer.from(MATRICOLA_SELECTOR)) + MATRICOLA_SELECTOR.length;

  return {
    ...emailVerifierInputs,
    fromEmailIndex: fromEmailIndex.toString(),
    nomeIndex: nomeIndex.toString(),
    dataIndex: dataIndex.toString(),
    importoIndex: importoIndex.toString(),
    matricolaIndex: matricolaIndex.toString(),
    IUVIndex: IUVIndex.toString(),
    address,
  };
}
