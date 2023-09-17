import { MigrationInterface, QueryRunner } from "typeorm";

export class BioColumnAddedInUserEntity1694939031017 implements MigrationInterface {
    name = 'BioColumnAddedInUserEntity1694939031017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "bio" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "bio"`);
    }

}
