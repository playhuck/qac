import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";
import { QuestionUserListEntity } from "./question.user.list.entity";

@Entity('user')
export class UserEntity extends CustomBaseEntity {

    @PrimaryGeneratedColumn({
        name: 'user_id',
        type: 'int'
    })
    userId!: number;

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

    @Column({
        name: 'cash',
        type: 'int',
        default: 0
    })
    cash!: number;

    @OneToMany(() => QuestionUserListEntity, (questionUserList) => questionUserList.user, {
        onDelete: 'CASCADE',
        cascade: true
    })
    questionUserList!: QuestionUserListEntity[];

};