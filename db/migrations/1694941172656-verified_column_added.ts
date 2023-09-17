import { MigrationInterface, QueryRunner } from "typeorm";

export class VerifiedColumnAdded1694941172656 implements MigrationInterface {
    name = 'VerifiedColumnAdded1694941172656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "verified"`);
    }

}
