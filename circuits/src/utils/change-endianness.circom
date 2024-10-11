pragma circom 2.1.5;

template ReverseBytes(byteWidth, numBytes) {
    signal input in;
    signal output out;

    // Divide l'input in blocchi di byte e inverte l'ordine dei byte
    signal byteArray[numBytes][8];

    // Converte l'input in bit
    component bits = Num2Bits(byteWidth);
    bits.in <== in;

    for (var i = 0; i < numBytes; i++) {
        for (var j = 0; j < 8; j++) {
            byteArray[i][j] <== bits.out[i * 8 + j]; // Corretta dimensione unidimensionale dell'accesso
        }
    }

    // Pack the bits in reverse order (invertendo i byte)
    component pack = Bits2Num(byteWidth);
    for (var i = 0; i < numBytes; i++) {
        for (var j = 0; j < 8; j++) {
            pack.in[(numBytes - 1 - i) * 8 + j] <== byteArray[i][j]; // Inversione dei byte
        }
    }

    out <== pack.out;
}
