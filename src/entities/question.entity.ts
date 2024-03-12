import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";
import { QuestionUserListEntity } from "./question.user.list.entity";
import { TQuestion } from "@models/types/t.question";

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
    questionMid!: string; // 제품 공유 값으로, 유저가 하루에 참여할 수 있는 양을 제한 함

    @Column({
        name: 'quantity',
        type: 'int',
        nullable: false
    })
    questionQuantity!: number; // 질문의 하루 최대 유저가 응시할 수 있는 양

    @Column({
        name: 'type',
        type: 'varchar',
        length: '64',
        nullable: false
    })
    questionType!: TQuestion;

    @Column({
        name: 'cash',
        type: 'int',
        nullable: false
    })
    questionCash!: number; // 질문을 맞췄을 때 지급될 캐쉬(포인트)

    @OneToMany(() => QuestionUserListEntity, (questionUserList) => questionUserList, {
        onDelete: 'CASCADE',
        cascade: true
    })
    questionUserList!: QuestionUserListEntity[];

}