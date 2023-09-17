import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1694934583855 implements MigrationInterface {
    name = 'Initial1694934583855'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_entity" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_token_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "refreshTokenHash" character varying NOT NULL, "expirationTime" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" integer, CONSTRAINT "REL_ebf65cd067163c7c66baa3da1c" UNIQUE ("userId"), CONSTRAINT "PK_a78813e06745b2c5d5b9776bfcf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token_entity" ADD CONSTRAINT "FK_ebf65cd067163c7c66baa3da1c1" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_token_entity" DROP CONSTRAINT "FK_ebf65cd067163c7c66baa3da1c1"`);
        await queryRunner.query(`DROP TABLE "refresh_token_entity"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
    }

}
