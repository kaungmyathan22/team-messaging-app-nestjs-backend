import { MigrationInterface, QueryRunner } from "typeorm";

export class VerificationCodeTableAdded1699423389520 implements MigrationInterface {
    name = 'VerificationCodeTableAdded1699423389520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."verification_code_entity_type_enum" AS ENUM('PASSWORD_RESET', 'EMAIL_VERIFICATION')`);
        await queryRunner.query(`CREATE TABLE "verification_code_entity" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "type" "public"."verification_code_entity_type_enum" NOT NULL DEFAULT 'PASSWORD_RESET', "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer, CONSTRAINT "REL_b6e5eafb0e724858db22ef7264" UNIQUE ("userId"), CONSTRAINT "PK_9e0773884bccceef1dbfecfb2ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "FK_b6e5eafb0e724858db22ef72642" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "FK_b6e5eafb0e724858db22ef72642"`);
        await queryRunner.query(`DROP TABLE "verification_code_entity"`);
        await queryRunner.query(`DROP TYPE "public"."verification_code_entity_type_enum"`);
    }

}
