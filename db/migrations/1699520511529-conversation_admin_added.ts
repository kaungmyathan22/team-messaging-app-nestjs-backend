import { MigrationInterface, QueryRunner } from "typeorm";

export class ConversationAdminAdded1699520511529 implements MigrationInterface {
    name = 'ConversationAdminAdded1699520511529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_entity" ADD "adminId" integer`);
        await queryRunner.query(`ALTER TABLE "conversation_entity" ADD CONSTRAINT "FK_5f237304146f01f4b133532e7a9" FOREIGN KEY ("adminId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_entity" DROP CONSTRAINT "FK_5f237304146f01f4b133532e7a9"`);
        await queryRunner.query(`ALTER TABLE "conversation_entity" DROP COLUMN "adminId"`);
    }

}
