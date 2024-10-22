// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@zk-email/contracts/DKIMRegistry.sol";
import "@zk-email/contracts/utils/StringUtils.sol";
import { Verifier } from "./Verifier.sol";

contract PolimiProofVerifier {
    using StringUtils for *;

    // Signal indices
    uint32 public constant pubKeyHashIndexInSignals = 4; // index of DKIM public key hash in signals array
    uint32 public constant nomeIndexInSignals = 0;
    uint32 public constant dataIndexInSignals = 1;
    uint32 public constant importoIndexInSignals = 2;
    uint32 public constant matricolaIndexInSignals = 3;
    uint32 public constant domainIndexInSignals = 5;

    string constant domain = "polimi.it"; // Domain for DKIM verification
    DKIMRegistry public dkimRegistry;
    Verifier public immutable verifier;

    constructor(Verifier _verifier, DKIMRegistry _dkimRegistry) {
        verifier = _verifier;
        dkimRegistry = _dkimRegistry;
    }

    /// Verifica la prova zk-SNARK per il circuito PolimiVC
    /// @param proof ZK proof del circuito - a[2], b[4], e c[2] codificati in serie
    /// @param signals I segnali pubblici del circuito: // signals[0] = nome, signals[1] = data, signals[2] = importo, signals[3] = matricola, signals[4] = pubkeyHash, signals[5] = dominio, signals[6] = address
    function verifyProof(
        uint256[8] memory proof,
        uint256[7] memory signals  
    ) public view returns (bool) {
       // Verify the DKIM public key hash stored on-chain matches the one used in circuit
        bytes32 dkimPublicKeyHashInCircuit = bytes32(signals[pubKeyHashIndexInSignals]);
        require(dkimRegistry.isDKIMPublicKeyHashValid(domain, dkimPublicKeyHashInCircuit), "invalid dkim signature"); 

        // Perform domain check on the sender's domain extracted from signals
        // require(_domainCheck(signals,domainIndexInSignals), "Invalid domain");

        // Verify RSA and proof
        require(
            verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                signals
            ),
            "Invalid Proof"
        );

        // Return true if the proof is valid
        return true;
    }

    /// Funzione di esempio per ottenere i dati verificati
    // function getVerificationData(
    //     uint256[8] memory proof, 
    //     uint256[7] memory signals
    // ) public view returns (string memory) {
    //     require(verifyProof(proof, signals), "Proof is invalid");

    //     // Decode the signals and return the verified data as strings
    //     string memory nome = convertSignalToString(signals, nomeIndexInSignals, 32);      // assuming nome is packed in 32 bytes
    //     string memory matricola = convertSignalToString(signals, matricolaIndexInSignals, 32); // assuming matricola is packed in 32 bytes
    //     string memory data = convertSignalToString(signals, dataIndexInSignals, 32);        // assuming data is packed in 32 bytes
    //     string memory importo = convertSignalToString(signals, importoIndexInSignals, 32);  // assuming importo is packed in 32 bytes

    //     return string(
    //         abi.encodePacked(
    //             "Nome: ", nome, 
    //             ", Matricola: ", matricola, 
    //             ", Data: ", data, 
    //             ", Importo: ", importo
    //         )
    //     );
    // }

    /// Helper function to convert a packed signal into a string
    // function convertSignalToString(uint256[7] memory signals, uint256 signalIndex, uint256 lengthInBytes) internal pure returns (string memory) {
    //     uint256[] memory packedSignal = new uint256[](lengthInBytes);
    //     for (uint256 i = signalIndex; i < (signalIndex + lengthInBytes); i++) {
    //         packedSignal[i - signalIndex] = signals[i];
    //     } // Assuming one signal can corresponds to more than one packed string element

    //     // Use the StringUtils library to unpack and convert to string
    //     return StringUtils.convertPackedBytesToString(
    //         packedSignal,
    //         lengthInBytes,   // The length in bytes of the string you expect to extract
    //         32               // Assume each uint256 holds 32 bytes of packed data
    //     );
    // }

  /// Function to check if the sender's domain is valid
function _domainCheck(uint256[7] memory signals, uint256 signalIndex) public pure returns (bool) {
    // Extract the sender's signal from the signals array at index 5
    uint256 senderSignal = signals[signalIndex];
    
    // Convert the packed bytes of the sender signal to a string (assuming it's packed bytes)
    string memory senderBytes = StringUtils.convertPackedByteToString(senderSignal, 31); // Assuming pack size is 31 bytes
    
    // Define the allowed domain strings
    string[2] memory domainStrings = ["messaggi.automatici@polimi.it", "polimi.it"];
    
    // Check if the sender's domain matches any of the allowed domains
    return
        StringUtils.stringEq(senderBytes, domainStrings[0]) || StringUtils.stringEq(senderBytes, domainStrings[1]);
}


}


