import { DIDResolutionResult, ParsedDID, DIDResolver, Resolvable, DIDResolutionOptions } from 'did-resolver';

/**
 * Function to parse the DID and extract the method and id components
 */
export function parse(didUrl: string): ParsedDID | null {
  const DID_MATCHER = /^did:([^:]+):([^?]+)(?:[?](.+))?(?:#(.+))?$/;
  const sections = didUrl.match(DID_MATCHER);

  if (sections) {
    return {
      did: `did:${sections[1]}:${sections[2]}`,
      method: sections[1],
      id: sections[2],
      didUrl,
      path: sections[3],
      fragment: sections[4]
    };
  }

  return null;
}


// Custom DID resolver function for 'did:emaildomain:polimi.it'
export function getPolimiDidResolver(): { [method: string]: DIDResolver } {
  const resolve: DIDResolver = async (
    did: string,
    parsed: ParsedDID,
    resolver: Resolvable,
    options: DIDResolutionOptions
  ): Promise<DIDResolutionResult> => {

    // Verify that the DID belongs to the 'emaildomain' namespace
    if (parsed.method !== 'emaildomain' || parsed.id !== 'polimi.it') {
      return {
        didDocument: null,
        didResolutionMetadata: { error: 'unsupportedDidMethod' },
        didDocumentMetadata: {}
      };
    }

    // Create a DID document associated with the Polimi domain
    const didDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: `did:emaildomain:polimi.it`,
      verificationMethod: [
        {
          id: `did:emaildomain:polimi.it#key-1`,
          type: 'EcdsaSecp256k1VerificationKey2018',
          controller: `did:emaildomain:polimi.it`,
          publicKeyBase64: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArrqfB98shqxeHsARHTc7LYDGgzdzhXUa1ByUw2+NZCmeKXk2fDbGCCw6sN5vS9spjhU9gvY8l5ghy840xMo8YispftRf01wf66YeoB+5wk1dERhE5H1DFWMXZ7z7G1/Hp/cXjRO5nWa4dvhFVLckGDk1bFfeelFaalHSTcuW9ZILMXi8SBs9hgou1GPkj2qoJDvqY6vR6qt0ac" "q+REyyY3DEgeIXN2y5ohHTFQerYLg5TWjtzk5MxjLanQSUrS2K50JlKGVLWbAixxFr45byHP1qVVef9vP2WMnnJNJsrETsP4sL1KD5wMftAb+Ri5WDGutC5zixeYWBIw3sg17BpwIDAQAB' 
        }
      ],
      authentication: [`did:emaildomain:polimi.it#key-1`],
      service: [
        {
          id: `did:emaildomain:polimi.it#email-service`,
          type: 'EmailService',
          serviceEndpoint: 'mailto:info@polimi.it'
        }
      ]
    };

    // Return the DID resolution result
    return {
      didDocument,
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
      didDocumentMetadata: { created: new Date().toISOString() }
    };
  };

  // Return the resolver for the 'emaildomain' method
  return { emaildomain: resolve };
}
