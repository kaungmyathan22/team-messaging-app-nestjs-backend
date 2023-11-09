import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatRelatedEntity1699515365413 implements MigrationInterface {
    name = 'ChatRelatedEntity1699515365413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "participant_entity" ("id" SERIAL NOT NULL, "read" integer NOT NULL, "nickName" character varying NOT NULL, "conversationId" integer, "userId" integer, CONSTRAINT "PK_b3f0633bceda938d37730ca62be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "conversation_entity" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, CONSTRAINT "PK_7ec5ee11cb5dcccb1ba428ee1e6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message_entity" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "content_type" character varying NOT NULL, "participantId" integer, CONSTRAINT "PK_45bb3707fbb99a73e831fee41e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722" FOREIGN KEY ("conversationId") REFERENCES "conversation_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "FK_f67fccd5a518e208737d7023988" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_entity" ADD CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c" FOREIGN KEY ("participantId") REFERENCES "participant_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message_entity" DROP CONSTRAINT "FK_e57e95146cabfd7af13fa877f6c"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_f67fccd5a518e208737d7023988"`);
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "FK_75c240cc98d5ebd37896b8d4722"`);
        await queryRunner.query(`DROP TABLE "message_entity"`);
        await queryRunner.query(`DROP TABLE "conversation_entity"`);
        await queryRunner.query(`DROP TABLE "participant_entity"`);
    }

}
