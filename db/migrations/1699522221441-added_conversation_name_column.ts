import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedConversationNameColumn1699522221441 implements MigrationInterface {
    name = 'AddedConversationNameColumn1699522221441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_entity" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation_entity" DROP COLUMN "name"`);
    }

}
