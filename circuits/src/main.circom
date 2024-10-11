pragma circom 2.1.5;

include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/circuits/utils/regex.circom";
include "./data-regex.circom"; 
include "./nome-cognome-regex.circom"; 
include "./importo-regex.circom";
include "./successo-regex.circom";
include "./matricola-regex.circom";
//include "./iuv-regex.circom";


template PolimiVC(maxHeaderLength, maxBodyLength, maxMonthBytes, maxYearBytes, n, k) {
    signal input emailHeader[maxHeaderLength];
    signal input emailHeaderLength;
    signal input pubkey[k];
    signal input signature[k];
    signal input emailBody[maxBodyLength];
    signal input emailBodyLength;
    signal input bodyHashIndex;
    signal input precomputedSHA[32];
    signal input fromEmailIndex;
    signal input nomeIndex;
    signal input dataIndex;
    signal input importoIndex;
    signal input matricolaIndex;
    signal input IUVIndex;
    signal input address;

    signal output nome;
    signal output data;
    signal output importo;
    signal output matricola;
    //signal output IUV;
    signal output pubkeyHash;
   

    component EV = EmailVerifier(maxHeaderLength, maxBodyLength, n, k, 0, 0, 0);
    EV.emailHeader <== emailHeader;
    EV.pubkey <== pubkey;
    EV.signature <== signature;
    EV.emailHeaderLength <== emailHeaderLength;
    EV.bodyHashIndex <== bodyHashIndex;
    EV.precomputedSHA <== precomputedSHA;
    EV.emailBody <== emailBody;
    EV.emailBodyLength <== emailBodyLength;

    pubkeyHash <== EV.pubkeyHash;

    
    // Assert fromEmailIndex < emailHeaderLength
    signal isFromIndexValid <== LessThan(log2Ceil(maxHeaderLength))([fromEmailIndex, emailHeaderLength]);
    isFromIndexValid === 1;

    // Estraggo il from
    signal (fromEmailFound, fromEmailReveal[maxHeaderLength]) <== FromAddrRegex(maxHeaderLength)(emailHeader);
    fromEmailFound === 1;

    var maxEmailLength = 255;

    signal fromEmailAddrPacks[9] <== PackRegexReveal(maxHeaderLength, maxEmailLength)(fromEmailReveal, fromEmailIndex);
    signal output fromEmailAddrOut <== fromEmailAddrPacks[0];


    // Controllo: emailHeaderLength deve essere inferiore a maxHeaderLength
    signal isEmailHeaderLengthValid <== LessThan(log2Ceil(maxHeaderLength))([emailHeaderLength, maxHeaderLength]);
    isEmailHeaderLengthValid === 1;

    // Verifica il subject
    signal successoFound <== SuccessoRegex(maxHeaderLength)(emailHeader);

    // Cerco la data dall'HEADER
    signal (dataFound, dataReveal[maxHeaderLength]) <== DataRegex(maxHeaderLength)(emailHeader);

    // Cerco il nome e cognome
    signal (nomeFound, nomeReveal[maxBodyLength]) <== NomeCognomeRegex(maxBodyLength)(emailBody);
    
    // Cerco la matricola
    signal (matricolaFound, matricolaReveal[maxBodyLength]) <== MatricolaRegex(maxBodyLength)(emailBody);

    // Cerco l'importo
    signal (importoFound, importoReveal[maxBodyLength]) <== ImportoRegex(maxBodyLength)(emailBody);
    
    // Cerco lo IUV
    //signal (IUVFound, IUVReveal[maxBodyLength]) <== IUVRegex(maxBodyLength)(emailBody);

    // Verifica che le regex facciano match
    signal isSuccessoFoundValid <== GreaterThan(1)([successoFound, 0]);
    signal isDataFoundValid <== GreaterThan(1)([dataFound, 0]);
    signal isNomeFoundValid <== GreaterThan(1)([nomeFound, 0]);
    signal isMatricolaFoundValid <== GreaterThan(1)([matricolaFound, 0]);
    //signal isIUVFoundValid <== GreaterThan(1)([IUVFound, 0]);
    signal isImportoFoundValid <== GreaterThan(1)([importoFound, 0]);

    isSuccessoFoundValid === 1;
    isDataFoundValid === 1;
    isNomeFoundValid === 1;
    isMatricolaFoundValid === 1;
    isImportoFoundValid === 1;
    //isIUVFoundValid === 1;

    // Estraggo la data
    var maxDataLength = 40;
    signal dataPacks[2] <== PackRegexReveal(maxHeaderLength, maxDataLength)(dataReveal, dataIndex);

    // Estraggo il nome
    var maxNameLength = 50;
    signal nomePacks[2] <== PackRegexReveal(maxBodyLength, maxNameLength)(nomeReveal, nomeIndex);

    // Estraggo l'importo
    var maxImportoLength = 10;
    signal importoPacks[1] <== PackRegexReveal(maxBodyLength, maxImportoLength)(importoReveal, importoIndex);

    // Estraggo la matricola
    //var maxMatricolaLength = 255;
    signal matricolaPacks[9] <== PackRegexReveal(maxBodyLength, maxEmailLength)(matricolaReveal, matricolaIndex);

    // Estraggo lo iuv
    //signal IUVPacks[9] <== PackRegexReveal(maxBodyLength, maxEmailLength)(IUVReveal, IUVIndex);

    // Assegno gli output pubblici
    nome <== nomePacks[0];
    matricola <== matricolaPacks[0];
    data <== dataPacks[0];
    importo <== importoPacks[0];
    //IUV <== IUVPacks[0];
}

component main { public [address] } = PolimiVC( 1024, 1536, 3, 4, 121, 17);

