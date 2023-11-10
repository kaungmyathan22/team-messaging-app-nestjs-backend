import { MigrationInterface, QueryRunner } from "typeorm";

export class OnDelteConstraintUpdates1699523159316 implements MigrationInterface {
    name = 'OnDelteConstraintUpdates1699523159316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_f67fccd5a518e208737d7023988"`);
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_f67fccd5a518e208737d7023988" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c" FOREIGN KEY ("participantId") REFERENCES "participant_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_f67fccd5a518e208737d7023988"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722"`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c" FOREIGN KEY ("participantId") REFERENCES "participant_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_f67fccd5a518e208737d7023988" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
