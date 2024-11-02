import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1730278050309 implements MigrationInterface {
    name = 'InitialMigration1730278050309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "key" ("kid" varchar PRIMARY KEY NOT NULL, "kms" varchar NOT NULL, "type" varchar NOT NULL, "publicKeyHex" varchar NOT NULL, "meta" text, "identifierDid" varchar)`);
        await queryRunner.query(`CREATE TABLE "service" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "serviceEndpoint" varchar NOT NULL, "description" varchar, "identifierDid" varchar)`);
        await queryRunner.query(`CREATE TABLE "claim" ("hash" varchar PRIMARY KEY NOT NULL, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "credentialType" text NOT NULL, "type" varchar NOT NULL, "value" text, "isObj" boolean NOT NULL, "issuerDid" varchar, "subjectDid" varchar, "credentialHash" varchar)`);
        await queryRunner.query(`CREATE TABLE "credential" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "issuerDid" varchar, "subjectDid" varchar)`);
        await queryRunner.query(`CREATE TABLE "presentation" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "holderDid" varchar)`);
        await queryRunner.query(`CREATE TABLE "message" ("id" varchar PRIMARY KEY NOT NULL, "saveDate" datetime NOT NULL, "updateDate" datetime NOT NULL, "createdAt" datetime, "expiresAt" datetime, "threadId" varchar, "type" varchar NOT NULL, "raw" varchar, "data" text, "replyTo" text, "replyUrl" varchar, "metaData" text, "fromDid" varchar, "toDid" varchar)`);
        await queryRunner.query(`CREATE TABLE "identifier" ("did" varchar PRIMARY KEY NOT NULL, "provider" varchar, "alias" varchar, "saveDate" datetime NOT NULL, "updateDate" datetime NOT NULL, "controllerKeyId" varchar)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6098cca69c838d91e55ef32fe1" ON "identifier" ("alias", "provider") `);
        await queryRunner.query(`CREATE TABLE "private-key" ("alias" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "privateKeyHex" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "presentation_verifier_identifier" ("presentationHash" varchar NOT NULL, "identifierDid" varchar NOT NULL, PRIMARY KEY ("presentationHash", "identifierDid"))`);
        await queryRunner.query(`CREATE INDEX "IDX_05b1eda0f6f5400cb173ebbc08" ON "presentation_verifier_identifier" ("presentationHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a460e48557bad5564504ddad9" ON "presentation_verifier_identifier" ("identifierDid") `);
        await queryRunner.query(`CREATE TABLE "presentation_credentials_credential" ("presentationHash" varchar NOT NULL, "credentialHash" varchar NOT NULL, PRIMARY KEY ("presentationHash", "credentialHash"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d796bcde5e182136266b2a6b72" ON "presentation_credentials_credential" ("presentationHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef88f92988763fee884c37db63" ON "presentation_credentials_credential" ("credentialHash") `);
        await queryRunner.query(`CREATE TABLE "message_presentations_presentation" ("messageId" varchar NOT NULL, "presentationHash" varchar NOT NULL, PRIMARY KEY ("messageId", "presentationHash"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7e7094f2cd6e5ec93914ac5138" ON "message_presentations_presentation" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a13b5cf828c669e61faf489c18" ON "message_presentations_presentation" ("presentationHash") `);
        await queryRunner.query(`CREATE TABLE "message_credentials_credential" ("messageId" varchar NOT NULL, "credentialHash" varchar NOT NULL, PRIMARY KEY ("messageId", "credentialHash"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1c111357e73db91a08525914b5" ON "message_credentials_credential" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ae8195a94b667b185d2c023e3" ON "message_credentials_credential" ("credentialHash") `);
        await queryRunner.query(`CREATE TABLE "temporary_key" ("kid" varchar PRIMARY KEY NOT NULL, "kms" varchar NOT NULL, "type" varchar NOT NULL, "publicKeyHex" varchar NOT NULL, "meta" text, "identifierDid" varchar, "privateKeyHex" varchar)`);
        await queryRunner.query(`INSERT INTO "temporary_key"("kid", "kms", "type", "publicKeyHex", "meta", "identifierDid") SELECT "kid", "kms", "type", "publicKeyHex", "meta", "identifierDid" FROM "key"`);
        await queryRunner.query(`DROP TABLE "key"`);
        await queryRunner.query(`ALTER TABLE "temporary_key" RENAME TO "key"`);
        await queryRunner.query(`CREATE TABLE "temporary_key" ("kid" varchar PRIMARY KEY NOT NULL, "kms" varchar NOT NULL, "type" varchar NOT NULL, "publicKeyHex" varchar NOT NULL, "meta" text, "identifierDid" varchar, "privateKeyHex" varchar, CONSTRAINT "FK_3f40a9459b53adf1729dbd3b787" FOREIGN KEY ("identifierDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_key"("kid", "kms", "type", "publicKeyHex", "meta", "identifierDid", "privateKeyHex") SELECT "kid", "kms", "type", "publicKeyHex", "meta", "identifierDid", "privateKeyHex" FROM "key"`);
        await queryRunner.query(`DROP TABLE "key"`);
        await queryRunner.query(`ALTER TABLE "temporary_key" RENAME TO "key"`);
        await queryRunner.query(`CREATE TABLE "temporary_service" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "serviceEndpoint" varchar NOT NULL, "description" varchar, "identifierDid" varchar, CONSTRAINT "FK_e16e0280d906951809f95dd09f1" FOREIGN KEY ("identifierDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_service"("id", "type", "serviceEndpoint", "description", "identifierDid") SELECT "id", "type", "serviceEndpoint", "description", "identifierDid" FROM "service"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`ALTER TABLE "temporary_service" RENAME TO "service"`);
        await queryRunner.query(`CREATE TABLE "temporary_claim" ("hash" varchar PRIMARY KEY NOT NULL, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "credentialType" text NOT NULL, "type" varchar NOT NULL, "value" text, "isObj" boolean NOT NULL, "issuerDid" varchar, "subjectDid" varchar, "credentialHash" varchar, CONSTRAINT "FK_d972c73d0f875c0d14c35b33baa" FOREIGN KEY ("issuerDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_f411679379d373424100a1c73f4" FOREIGN KEY ("subjectDid") REFERENCES "identifier" ("did") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_3d494b79143de3d0e793883e351" FOREIGN KEY ("credentialHash") REFERENCES "credential" ("hash") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_claim"("hash", "issuanceDate", "expirationDate", "context", "credentialType", "type", "value", "isObj", "issuerDid", "subjectDid", "credentialHash") SELECT "hash", "issuanceDate", "expirationDate", "context", "credentialType", "type", "value", "isObj", "issuerDid", "subjectDid", "credentialHash" FROM "claim"`);
        await queryRunner.query(`DROP TABLE "claim"`);
        await queryRunner.query(`ALTER TABLE "temporary_claim" RENAME TO "claim"`);
        await queryRunner.query(`CREATE TABLE "temporary_credential" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "issuerDid" varchar, "subjectDid" varchar, CONSTRAINT "FK_123d0977e0976565ee0932c0b9e" FOREIGN KEY ("issuerDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_b790831f44e2fa7f9661a017b0a" FOREIGN KEY ("subjectDid") REFERENCES "identifier" ("did") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_credential"("hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "issuerDid", "subjectDid") SELECT "hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "issuerDid", "subjectDid" FROM "credential"`);
        await queryRunner.query(`DROP TABLE "credential"`);
        await queryRunner.query(`ALTER TABLE "temporary_credential" RENAME TO "credential"`);
        await queryRunner.query(`CREATE TABLE "temporary_presentation" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "holderDid" varchar, CONSTRAINT "FK_a5e418449d9f527776a3bd0ca61" FOREIGN KEY ("holderDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_presentation"("hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "holderDid") SELECT "hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "holderDid" FROM "presentation"`);
        await queryRunner.query(`DROP TABLE "presentation"`);
        await queryRunner.query(`ALTER TABLE "temporary_presentation" RENAME TO "presentation"`);
        await queryRunner.query(`CREATE TABLE "temporary_message" ("id" varchar PRIMARY KEY NOT NULL, "saveDate" datetime NOT NULL, "updateDate" datetime NOT NULL, "createdAt" datetime, "expiresAt" datetime, "threadId" varchar, "type" varchar NOT NULL, "raw" varchar, "data" text, "replyTo" text, "replyUrl" varchar, "metaData" text, "fromDid" varchar, "toDid" varchar, CONSTRAINT "FK_63bf73143b285c727bd046e6710" FOREIGN KEY ("fromDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_1a666b2c29bb2b68d91259f55df" FOREIGN KEY ("toDid") REFERENCES "identifier" ("did") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_message"("id", "saveDate", "updateDate", "createdAt", "expiresAt", "threadId", "type", "raw", "data", "replyTo", "replyUrl", "metaData", "fromDid", "toDid") SELECT "id", "saveDate", "updateDate", "createdAt", "expiresAt", "threadId", "type", "raw", "data", "replyTo", "replyUrl", "metaData", "fromDid", "toDid" FROM "message"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`ALTER TABLE "temporary_message" RENAME TO "message"`);
        await queryRunner.query(`DROP INDEX "IDX_05b1eda0f6f5400cb173ebbc08"`);
        await queryRunner.query(`DROP INDEX "IDX_3a460e48557bad5564504ddad9"`);
        await queryRunner.query(`CREATE TABLE "temporary_presentation_verifier_identifier" ("presentationHash" varchar NOT NULL, "identifierDid" varchar NOT NULL, CONSTRAINT "FK_05b1eda0f6f5400cb173ebbc086" FOREIGN KEY ("presentationHash") REFERENCES "presentation" ("hash") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_3a460e48557bad5564504ddad90" FOREIGN KEY ("identifierDid") REFERENCES "identifier" ("did") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("presentationHash", "identifierDid"))`);
        await queryRunner.query(`INSERT INTO "temporary_presentation_verifier_identifier"("presentationHash", "identifierDid") SELECT "presentationHash", "identifierDid" FROM "presentation_verifier_identifier"`);
        await queryRunner.query(`DROP TABLE "presentation_verifier_identifier"`);
        await queryRunner.query(`ALTER TABLE "temporary_presentation_verifier_identifier" RENAME TO "presentation_verifier_identifier"`);
        await queryRunner.query(`CREATE INDEX "IDX_05b1eda0f6f5400cb173ebbc08" ON "presentation_verifier_identifier" ("presentationHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_3a460e48557bad5564504ddad9" ON "presentation_verifier_identifier" ("identifierDid") `);
        await queryRunner.query(`DROP INDEX "IDX_d796bcde5e182136266b2a6b72"`);
        await queryRunner.query(`DROP INDEX "IDX_ef88f92988763fee884c37db63"`);
        await queryRunner.query(`CREATE TABLE "temporary_presentation_credentials_credential" ("presentationHash" varchar NOT NULL, "credentialHash" varchar NOT NULL, CONSTRAINT "FK_d796bcde5e182136266b2a6b72c" FOREIGN KEY ("presentationHash") REFERENCES "presentation" ("hash") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_ef88f92988763fee884c37db63b" FOREIGN KEY ("credentialHash") REFERENCES "credential" ("hash") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("presentationHash", "credentialHash"))`);
        await queryRunner.query(`INSERT INTO "temporary_presentation_credentials_credential"("presentationHash", "credentialHash") SELECT "presentationHash", "credentialHash" FROM "presentation_credentials_credential"`);
        await queryRunner.query(`DROP TABLE "presentation_credentials_credential"`);
        await queryRunner.query(`ALTER TABLE "temporary_presentation_credentials_credential" RENAME TO "presentation_credentials_credential"`);
        await queryRunner.query(`CREATE INDEX "IDX_d796bcde5e182136266b2a6b72" ON "presentation_credentials_credential" ("presentationHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_ef88f92988763fee884c37db63" ON "presentation_credentials_credential" ("credentialHash") `);
        await queryRunner.query(`DROP INDEX "IDX_7e7094f2cd6e5ec93914ac5138"`);
        await queryRunner.query(`DROP INDEX "IDX_a13b5cf828c669e61faf489c18"`);
        await queryRunner.query(`CREATE TABLE "temporary_message_presentations_presentation" ("messageId" varchar NOT NULL, "presentationHash" varchar NOT NULL, CONSTRAINT "FK_7e7094f2cd6e5ec93914ac5138f" FOREIGN KEY ("messageId") REFERENCES "message" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_a13b5cf828c669e61faf489c182" FOREIGN KEY ("presentationHash") REFERENCES "presentation" ("hash") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("messageId", "presentationHash"))`);
        await queryRunner.query(`INSERT INTO "temporary_message_presentations_presentation"("messageId", "presentationHash") SELECT "messageId", "presentationHash" FROM "message_presentations_presentation"`);
        await queryRunner.query(`DROP TABLE "message_presentations_presentation"`);
        await queryRunner.query(`ALTER TABLE "temporary_message_presentations_presentation" RENAME TO "message_presentations_presentation"`);
        await queryRunner.query(`CREATE INDEX "IDX_7e7094f2cd6e5ec93914ac5138" ON "message_presentations_presentation" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a13b5cf828c669e61faf489c18" ON "message_presentations_presentation" ("presentationHash") `);
        await queryRunner.query(`DROP INDEX "IDX_1c111357e73db91a08525914b5"`);
        await queryRunner.query(`DROP INDEX "IDX_8ae8195a94b667b185d2c023e3"`);
        await queryRunner.query(`CREATE TABLE "temporary_message_credentials_credential" ("messageId" varchar NOT NULL, "credentialHash" varchar NOT NULL, CONSTRAINT "FK_1c111357e73db91a08525914b59" FOREIGN KEY ("messageId") REFERENCES "message" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_8ae8195a94b667b185d2c023e33" FOREIGN KEY ("credentialHash") REFERENCES "credential" ("hash") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("messageId", "credentialHash"))`);
        await queryRunner.query(`INSERT INTO "temporary_message_credentials_credential"("messageId", "credentialHash") SELECT "messageId", "credentialHash" FROM "message_credentials_credential"`);
        await queryRunner.query(`DROP TABLE "message_credentials_credential"`);
        await queryRunner.query(`ALTER TABLE "temporary_message_credentials_credential" RENAME TO "message_credentials_credential"`);
        await queryRunner.query(`CREATE INDEX "IDX_1c111357e73db91a08525914b5" ON "message_credentials_credential" ("messageId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ae8195a94b667b185d2c023e3" ON "message_credentials_credential" ("credentialHash") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_8ae8195a94b667b185d2c023e3"`);
        await queryRunner.query(`DROP INDEX "IDX_1c111357e73db91a08525914b5"`);
        await queryRunner.query(`ALTER TABLE "message_credentials_credential" RENAME TO "temporary_message_credentials_credential"`);
        await queryRunner.query(`CREATE TABLE "message_credentials_credential" ("messageId" varchar NOT NULL, "credentialHash" varchar NOT NULL, PRIMARY KEY ("messageId", "credentialHash"))`);
        await queryRunner.query(`INSERT INTO "message_credentials_credential"("messageId", "credentialHash") SELECT "messageId", "credentialHash" FROM "temporary_message_credentials_credential"`);
        await queryRunner.query(`DROP TABLE "temporary_message_credentials_credential"`);
        await queryRunner.query(`CREATE INDEX "IDX_8ae8195a94b667b185d2c023e3" ON "message_credentials_credential" ("credentialHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_1c111357e73db91a08525914b5" ON "message_credentials_credential" ("messageId") `);
        await queryRunner.query(`DROP INDEX "IDX_a13b5cf828c669e61faf489c18"`);
        await queryRunner.query(`DROP INDEX "IDX_7e7094f2cd6e5ec93914ac5138"`);
        await queryRunner.query(`ALTER TABLE "message_presentations_presentation" RENAME TO "temporary_message_presentations_presentation"`);
        await queryRunner.query(`CREATE TABLE "message_presentations_presentation" ("messageId" varchar NOT NULL, "presentationHash" varchar NOT NULL, PRIMARY KEY ("messageId", "presentationHash"))`);
        await queryRunner.query(`INSERT INTO "message_presentations_presentation"("messageId", "presentationHash") SELECT "messageId", "presentationHash" FROM "temporary_message_presentations_presentation"`);
        await queryRunner.query(`DROP TABLE "temporary_message_presentations_presentation"`);
        await queryRunner.query(`CREATE INDEX "IDX_a13b5cf828c669e61faf489c18" ON "message_presentations_presentation" ("presentationHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_7e7094f2cd6e5ec93914ac5138" ON "message_presentations_presentation" ("messageId") `);
        await queryRunner.query(`DROP INDEX "IDX_ef88f92988763fee884c37db63"`);
        await queryRunner.query(`DROP INDEX "IDX_d796bcde5e182136266b2a6b72"`);
        await queryRunner.query(`ALTER TABLE "presentation_credentials_credential" RENAME TO "temporary_presentation_credentials_credential"`);
        await queryRunner.query(`CREATE TABLE "presentation_credentials_credential" ("presentationHash" varchar NOT NULL, "credentialHash" varchar NOT NULL, PRIMARY KEY ("presentationHash", "credentialHash"))`);
        await queryRunner.query(`INSERT INTO "presentation_credentials_credential"("presentationHash", "credentialHash") SELECT "presentationHash", "credentialHash" FROM "temporary_presentation_credentials_credential"`);
        await queryRunner.query(`DROP TABLE "temporary_presentation_credentials_credential"`);
        await queryRunner.query(`CREATE INDEX "IDX_ef88f92988763fee884c37db63" ON "presentation_credentials_credential" ("credentialHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_d796bcde5e182136266b2a6b72" ON "presentation_credentials_credential" ("presentationHash") `);
        await queryRunner.query(`DROP INDEX "IDX_3a460e48557bad5564504ddad9"`);
        await queryRunner.query(`DROP INDEX "IDX_05b1eda0f6f5400cb173ebbc08"`);
        await queryRunner.query(`ALTER TABLE "presentation_verifier_identifier" RENAME TO "temporary_presentation_verifier_identifier"`);
        await queryRunner.query(`CREATE TABLE "presentation_verifier_identifier" ("presentationHash" varchar NOT NULL, "identifierDid" varchar NOT NULL, PRIMARY KEY ("presentationHash", "identifierDid"))`);
        await queryRunner.query(`INSERT INTO "presentation_verifier_identifier"("presentationHash", "identifierDid") SELECT "presentationHash", "identifierDid" FROM "temporary_presentation_verifier_identifier"`);
        await queryRunner.query(`DROP TABLE "temporary_presentation_verifier_identifier"`);
        await queryRunner.query(`CREATE INDEX "IDX_3a460e48557bad5564504ddad9" ON "presentation_verifier_identifier" ("identifierDid") `);
        await queryRunner.query(`CREATE INDEX "IDX_05b1eda0f6f5400cb173ebbc08" ON "presentation_verifier_identifier" ("presentationHash") `);
        await queryRunner.query(`ALTER TABLE "message" RENAME TO "temporary_message"`);
        await queryRunner.query(`CREATE TABLE "message" ("id" varchar PRIMARY KEY NOT NULL, "saveDate" datetime NOT NULL, "updateDate" datetime NOT NULL, "createdAt" datetime, "expiresAt" datetime, "threadId" varchar, "type" varchar NOT NULL, "raw" varchar, "data" text, "replyTo" text, "replyUrl" varchar, "metaData" text, "fromDid" varchar, "toDid" varchar)`);
        await queryRunner.query(`INSERT INTO "message"("id", "saveDate", "updateDate", "createdAt", "expiresAt", "threadId", "type", "raw", "data", "replyTo", "replyUrl", "metaData", "fromDid", "toDid") SELECT "id", "saveDate", "updateDate", "createdAt", "expiresAt", "threadId", "type", "raw", "data", "replyTo", "replyUrl", "metaData", "fromDid", "toDid" FROM "temporary_message"`);
        await queryRunner.query(`DROP TABLE "temporary_message"`);
        await queryRunner.query(`ALTER TABLE "presentation" RENAME TO "temporary_presentation"`);
        await queryRunner.query(`CREATE TABLE "presentation" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "holderDid" varchar)`);
        await queryRunner.query(`INSERT INTO "presentation"("hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "holderDid") SELECT "hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "holderDid" FROM "temporary_presentation"`);
        await queryRunner.query(`DROP TABLE "temporary_presentation"`);
        await queryRunner.query(`ALTER TABLE "credential" RENAME TO "temporary_credential"`);
        await queryRunner.query(`CREATE TABLE "credential" ("hash" varchar PRIMARY KEY NOT NULL, "raw" text NOT NULL, "id" varchar, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "type" text NOT NULL, "issuerDid" varchar, "subjectDid" varchar)`);
        await queryRunner.query(`INSERT INTO "credential"("hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "issuerDid", "subjectDid") SELECT "hash", "raw", "id", "issuanceDate", "expirationDate", "context", "type", "issuerDid", "subjectDid" FROM "temporary_credential"`);
        await queryRunner.query(`DROP TABLE "temporary_credential"`);
        await queryRunner.query(`ALTER TABLE "claim" RENAME TO "temporary_claim"`);
        await queryRunner.query(`CREATE TABLE "claim" ("hash" varchar PRIMARY KEY NOT NULL, "issuanceDate" datetime NOT NULL, "expirationDate" datetime, "context" text NOT NULL, "credentialType" text NOT NULL, "type" varchar NOT NULL, "value" text, "isObj" boolean NOT NULL, "issuerDid" varchar, "subjectDid" varchar, "credentialHash" varchar)`);
        await queryRunner.query(`INSERT INTO "claim"("hash", "issuanceDate", "expirationDate", "context", "credentialType", "type", "value", "isObj", "issuerDid", "subjectDid", "credentialHash") SELECT "hash", "issuanceDate", "expirationDate", "context", "credentialType", "type", "value", "isObj", "issuerDid", "subjectDid", "credentialHash" FROM "temporary_claim"`);
        await queryRunner.query(`DROP TABLE "temporary_claim"`);
        await queryRunner.query(`ALTER TABLE "service" RENAME TO "temporary_service"`);
        await queryRunner.query(`CREATE TABLE "service" ("id" varchar PRIMARY KEY NOT NULL, "type" varchar NOT NULL, "serviceEndpoint" varchar NOT NULL, "description" varchar, "identifierDid" varchar)`);
        await queryRunner.query(`INSERT INTO "service"("id", "type", "serviceEndpoint", "description", "identifierDid") SELECT "id", "type", "serviceEndpoint", "description", "identifierDid" FROM "temporary_service"`);
        await queryRunner.query(`DROP TABLE "temporary_service"`);
        await queryRunner.query(`ALTER TABLE "key" RENAME TO "temporary_key"`);
        await queryRunner.query(`CREATE TABLE "key" ("kid" varchar PRIMARY KEY NOT NULL, "kms" varchar NOT NULL, "type" varchar NOT NULL, "publicKeyHex" varchar NOT NULL, "meta" text, "identifierDid" varchar, "privateKeyHex" varchar)`);
        await queryRunner.query(`INSERT INTO "key"("kid", "kms", "type", "publicKeyHex", "meta", "identifierDid", "privateKeyHex") SELECT "kid", "kms", "type", "publicKeyHex", "meta", "identifierDid", "privateKeyHex" FROM "temporary_key"`);
        await queryRunner.query(`DROP TABLE "temporary_key"`);
        await queryRunner.query(`ALTER TABLE "key" RENAME TO "temporary_key"`);
        await queryRunner.query(`CREATE TABLE "key" ("kid" varchar PRIMARY KEY NOT NULL, "kms" varchar NOT NULL, "type" varchar NOT NULL, "publicKeyHex" varchar NOT NULL, "meta" text, "identifierDid" varchar)`);
        await queryRunner.query(`INSERT INTO "key"("kid", "kms", "type", "publicKeyHex", "meta", "identifierDid") SELECT "kid", "kms", "type", "publicKeyHex", "meta", "identifierDid" FROM "temporary_key"`);
        await queryRunner.query(`DROP TABLE "temporary_key"`);
        await queryRunner.query(`DROP INDEX "IDX_8ae8195a94b667b185d2c023e3"`);
        await queryRunner.query(`DROP INDEX "IDX_1c111357e73db91a08525914b5"`);
        await queryRunner.query(`DROP TABLE "message_credentials_credential"`);
        await queryRunner.query(`DROP INDEX "IDX_a13b5cf828c669e61faf489c18"`);
        await queryRunner.query(`DROP INDEX "IDX_7e7094f2cd6e5ec93914ac5138"`);
        await queryRunner.query(`DROP TABLE "message_presentations_presentation"`);
        await queryRunner.query(`DROP INDEX "IDX_ef88f92988763fee884c37db63"`);
        await queryRunner.query(`DROP INDEX "IDX_d796bcde5e182136266b2a6b72"`);
        await queryRunner.query(`DROP TABLE "presentation_credentials_credential"`);
        await queryRunner.query(`DROP INDEX "IDX_3a460e48557bad5564504ddad9"`);
        await queryRunner.query(`DROP INDEX "IDX_05b1eda0f6f5400cb173ebbc08"`);
        await queryRunner.query(`DROP TABLE "presentation_verifier_identifier"`);
        await queryRunner.query(`DROP TABLE "private-key"`);
        await queryRunner.query(`DROP INDEX "IDX_6098cca69c838d91e55ef32fe1"`);
        await queryRunner.query(`DROP TABLE "identifier"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "presentation"`);
        await queryRunner.query(`DROP TABLE "credential"`);
        await queryRunner.query(`DROP TABLE "claim"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP TABLE "key"`);
    }

}