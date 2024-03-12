import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";
import { QuestionEntity } from "./question.entity";

@Entity('admin')
export class AdminEntity extends CustomBaseEntity {

    @PrimaryGeneratedColumn({
        name: 'admin_id',
        type: 'int'
    })
    adminId!: number;

    @Index()
    @Column({
        name: 'email',
        type: 'varchar',
        length: 128
    })
    email!: string;

    @Column({
        name: 'password',
        type: 'varchar',
        length: 256
    })
    password!: string;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 64
    })
    name!: string;

    @OneToMany(() => QuestionEntity, (question) => question.admin)
    questions!: QuestionEntity[];

};