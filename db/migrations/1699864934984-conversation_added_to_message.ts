import { MigrationInterface, QueryRunner } from "typeorm";

export class ConversationAddedToMessage1699864934984 implements MigrationInterface {
    name = 'ConversationAddedToMessage1699864934984'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c"`);
        await queryRunner.query(`ALTER TABLE "message_entity" DROP COLUMN "participantId"`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD "senderId" integer`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD "conversationId" integer`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_e88494eab57fef78157e330fe29" FOREIGN KEY ("senderId") REFERENCES "participant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_ac8f65d962e6c743c698b20e3fa"`);
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_e88494eab57fef78157e330fe29"`);
        await queryRunner.query(`ALTER TABLE "message_entity" DROP COLUMN "conversationId"`);
        await queryRunner.query(`ALTER TABLE "message_entity" DROP COLUMN "senderId"`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD "participantId" integer`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c" FOREIGN KEY ("participantId") REFERENCES "participant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
