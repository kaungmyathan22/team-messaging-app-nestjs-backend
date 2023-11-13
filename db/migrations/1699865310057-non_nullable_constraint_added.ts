import { MigrationInterface, QueryRunner } from "typeorm";

export class NonNullableConstraintAdded1699865310057 implements MigrationInterface {
    name = 'NonNullableConstraintAdded1699865310057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa"`);
        await queryRunner.query(`ALTER TABLE "message_entity" ALTER COLUMN "conversationId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa"`);
        await queryRunner.query(`ALTER TABLE "message_entity" ALTER COLUMN "conversationId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
