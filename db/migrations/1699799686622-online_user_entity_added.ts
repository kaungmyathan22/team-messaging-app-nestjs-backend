import { MigrationInterface, QueryRunner } from "typeorm";

export class OnlineUserEntityAdded1699799686622 implements MigrationInterface {
    name = 'OnlineUserEntityAdded1699799686622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "online_user_entity" ("id" SERIAL NOT NULL, "socketId" character varying NOT NULL, "userId" integer, CONSTRAINT "REL_ed13474afbc09397180fd87c87" UNIQUE ("userId"), CONSTRAINT "PK_081d9a7170bdd92cf1d26cdffad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "online_user_entity" ADD CONSTRAINT "FK_ed13474afbc09397180fd87c876" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "online_user_entity" DROP CONSTRAINT "FK_ed13474afbc09397180fd87c876"`);
        await queryRunner.query(`DROP TABLE "online_user_entity"`);
    }

}
