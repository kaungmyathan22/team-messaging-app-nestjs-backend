import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetTokenEntity1695025727457 implements MigrationInterface {
    name = 'PasswordResetTokenEntity1695025727457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_token_entity" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer, CONSTRAINT "REL_4a0222f5f5b306cce0277c3b16" UNIQUE ("userId"), CONSTRAINT "PK_6e44372654725cce46fe5fc8877" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "password_reset_token_entity" ADD CONSTRAINT "FK_4a0222f5f5b306cce0277c3b16a" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_token_entity" DROP CONSTRAINT "FK_4a0222f5f5b306cce0277c3b16a"`);
        await queryRunner.query(`DROP TABLE "password_reset_token_entity"`);
    }

}
