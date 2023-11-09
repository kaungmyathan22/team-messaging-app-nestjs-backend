import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueTogetherConstraintParticipants1699516398086 implements MigrationInterface {
    name = 'UniqueTogetherConstraintParticipants1699516398086'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant_entity" ADD CONSTRAINT "UQ_cbecfe9bd07c32d562ab5c2d5f7" UNIQUE ("conversationId", "userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant_entity" DROP CONSTRAINT "UQ_cbecfe9bd07c32d562ab5c2d5f7"`);
    }

}
