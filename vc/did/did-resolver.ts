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
          type: 'RsaVerificationKey2018',
          controller: `did:emaildomain:polimi.it`,
          publicKeyPem: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoInYVAa6hwoFWbqnI4bJvhurEK3KMdc6fARKLoSj/sXKnjNDgqBzUM9y0lb7Oa2Erxzd2hjjZicF7eaVepobneZqyqxM1TsrJVJbGsHM6lVeFhDFxACIT5iWbooCyA7o/J/1kD7SR78llaInpabdoNCxhhnRfBsoBc1tRV49Q25bWbkQ2EU2wbFyzIBGWzRz0QIplHElxgropOUZqzEGrQfLxO/n00IgGWTldurezUdpqwKUA7PFUPVw3G0JovBXOjyPPcn2Nvps/jYsVGulQfomMX5pc+Ol6rqOTt9QywIVm5I+CJKyJZq4+Hh2IkuZJyRHRYxBCZTEs5ZQelSQBQIDAQAB`
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
