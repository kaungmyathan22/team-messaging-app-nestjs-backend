import { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultFieldsAddedToTheConversation1699521212523 implements MigrationInterface {
    name = 'DefaultFieldsAddedToTheConversation1699521212523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant_entity" ALTER COLUMN "read" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ALTER COLUMN "nickName" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "participant_entity" ALTER COLUMN "nickName" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "participant_entity" ALTER COLUMN "read" DROP DEFAULT`);
    }

}
