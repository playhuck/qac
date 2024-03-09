import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";
import { QuestionUserListEntity } from "./question.user.list.entity";

@Entity('question')
export class QuestionEntity extends CustomBaseEntity {
    
    @PrimaryGeneratedColumn({
        name: 'question_id',
        type: 'int'
    })
    questionId!: number;

    @Column({
        name: 'title',
        type: 'varchar',
        length: '256',
        nullable: false
    })
    questionTitle!: string;

    @Column({
        name: 'answer',
        type: 'varchar',
        length: '256',
        nullable: false
    })
    questionAnswer!: string;

    @Column({
        name: 'mid',
        type: 'varchar',
        length: '256',
        nullable: false
    })
    questionMid!: string;

    @Column({
        name: 'quantity',
        type: 'int',
        nullable: false
    })
    questionQuantity!: number;

    @Column({
        name: 'type',
        type: 'varchar',
        length: '64',
        nullable: false
    })
    questionType!: string;

    @OneToMany(() => QuestionUserListEntity, (questionUserList) => questionUserList, {
        onDelete: 'CASCADE',
        cascade: true
    })
    questionUserList!: QuestionUserListEntity[];

}