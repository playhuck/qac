import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";

@Entity('question_mid')
export class QuestionMidEntity extends CustomBaseEntity {

    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int'
    })
    questionMidId!: number;

    @Column({
        name: 'question_mid',
        type: 'varchar',
        length: '256',
        nullable: false
    })
    questionMid!: number;

}