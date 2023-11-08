import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueTogetherConstraint1699423665056 implements MigrationInterface {
    name = 'UniqueTogetherConstraint1699423665056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "verification_entity_unique_together" UNIQUE ("userId", "code", "type")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "verification_entity_unique_together"`);
    }

}
