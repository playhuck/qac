import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CustomBaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";
import { QuestionEntity } from "./question.entity";

@Entity('question_user_list')
export class QuestionUserListEntity extends CustomBaseEntity {

    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int'
    })
    questionUserListId!: number;

    @Column({
        name: 'question_id',
        type: 'int'
    })
    questionId!: number;

    @Column({
        name: 'user_id',
        type: 'int'
    })
    userId!: number;

    @Column({
        name: 'is_answer',
        type: 'tinyint'
    })
    isAnswer!: number;

    @ManyToOne(() => UserEntity, user => user.questionUserList)
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => QuestionEntity, question => question.questionUserList)
    @JoinColumn({ name: 'question_id' })
    question!: QuestionEntity;

}