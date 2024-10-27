// Helper function to convert little endian bigint to string
export function bigIntToStringLE(bigintValue: bigint): string {
    const hex = bigintValue.toString(16).padStart(64, '0'); // convert to hex and pad
    const bytes = hex.match(/.{1,2}/g)?.reverse(); // split into byte pairs and reverse
    const littleEndianHex = bytes?.join('') || '';
    return Buffer.from(littleEndianHex, 'hex').toString(); // convert to string
}