import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOneToOneConstraitn1699423897498 implements MigrationInterface {
    name = 'RemoveOneToOneConstraitn1699423897498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "FK_b6e5eafb0e724858db22ef72642"`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "verification_entity_unique_together"`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "REL_b6e5eafb0e724858db22ef7264"`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "verification_entity_unique_together" UNIQUE ("userId", "code", "type")`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "FK_b6e5eafb0e724858db22ef72642" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "FK_b6e5eafb0e724858db22ef72642"`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" DROP CONSTRAINT "verification_entity_unique_together"`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "REL_b6e5eafb0e724858db22ef7264" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "verification_entity_unique_together" UNIQUE ("code", "type", "userId")`);
        await queryRunner.query(`ALTER TABLE "verification_code_entity" ADD CONSTRAINT "FK_b6e5eafb0e724858db22ef72642" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
