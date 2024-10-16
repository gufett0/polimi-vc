// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@zk-email/contracts/DKIMRegistry.sol";
import "@zk-email/contracts/utils/StringUtils.sol";
import { Verifier } from "./Verifier.sol";

contract PolimiProofVerifier {
    using StringUtils for *;

    // Signal indices
    uint32 public constant pubKeyHashIndexInSignals = 0; // index of DKIM public key hash in signals array
    uint32 public constant nomeIndexInSignals = 1; // index of nome in signals array
    uint32 public constant matricolaIndexInSignals = 2; // index of matricola in signals array
    uint32 public constant dataIndexInSignals = 3; // index of data in signals array
    uint32 public constant importoIndexInSignals = 4; // index of importo in signals array

    string constant domain = "polimi.it"; // Domain for DKIM verification
    DKIMRegistry public dkimRegistry;
    Verifier public immutable verifier;

    constructor(Verifier _verifier, DKIMRegistry _dkimRegistry) {
        verifier = _verifier;
        dkimRegistry = _dkimRegistry;
    }

    /// Verifica la prova zk-SNARK per il circuito PolimiVC
    /// @param proof ZK proof del circuito - a[2], b[4], e c[2] codificati in serie
    /// @param signals I segnali pubblici del circuito: signals[0] = pubkeyHash, signals[1] = nome, signals[2] = matricola, signals[3] = data, signals[4] = importo
    function verifyProof(
        uint256[8] memory proof,
        uint256[7] memory signals  // signals[0] = pubkeyHash, signals[1] = nome, signals[2] = matricola, signals[3] = data, signals[4] = importo
    ) public view returns (bool) {
        // Verify DKIM public key hash stored on-chain matches the one in the circuit
        bytes32 dkimPublicKeyHashInCircuit = bytes32(signals[pubKeyHashIndexInSignals]);
        require(
            dkimRegistry.isDKIMPublicKeyHashValid(domain, dkimPublicKeyHashInCircuit),
            "Invalid DKIM signature"
        );

    

        // Verify the proof using the Verifier contract
        bool validProof = verifier.verifyProof(
            [proof[0], proof[1]],
            [[proof[2], proof[3]], [proof[4], proof[5]]],
            [proof[6], proof[7]],
            signals
        );

        // Return true if the proof is valid, otherwise false
        return validProof;
    }

    /// Funzione di esempio per ottenere i dati verificati
    function getVerificationData(
        uint256[8] memory proof, 
        uint256[7] memory signals
    ) public view returns (string memory) {
        require(verifyProof(proof, signals), "Proof is invalid");

        // Decode the signals and return the verified data
        string memory nome = uintToString(signals[nomeIndexInSignals]);
        string memory matricola = uintToString(signals[matricolaIndexInSignals]);
        string memory data = uintToString(signals[dataIndexInSignals]);
        string memory importo = uintToString(signals[importoIndexInSignals]);

        return string(
            abi.encodePacked(
                "Nome: ", nome, 
                ", Matricola: ", matricola, 
                ", Data: ", data, 
                ", Importo: ", importo
            )
        );
    }

    function uintToString(uint256 _value) internal pure returns (string memory) {
        return Strings.toString(_value);
    }
}
