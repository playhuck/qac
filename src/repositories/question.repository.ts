import { Injectable } from "@nestjs/common";
import { Repository, DataSource, EntityManager, LessThan, FindOptionsWhere, MoreThan } from "typeorm";

import { UserEntity } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSignUpDto } from "@dtos/users/post.sign.up.dto";
import { AdminEntity } from "@entities/admin.entity";
import { PostQuestionDto } from "@dtos/questions/post.question.dto";
import { QuestionEntity } from "@entities/question.entity";
import { QuestionMidEntity } from "@entities/question.mid.entity";
import { QuestionUserListEntity } from "@entities/question.user.list.entity";
import { QueryCursorQuestionDto } from "@dtos/questions/query.cursor.question.dto";

@Injectable()
export class QuestionRepository {

    constructor(
        @InjectRepository(QuestionEntity) private questionRepo: Repository<QuestionEntity>,
        @InjectRepository(QuestionMidEntity) private questionMidRepo: Repository<QuestionMidEntity>,
        @InjectRepository(QuestionUserListEntity) private questionUserListRepo: Repository<QuestionUserListEntity>,
    ) { };

    async getQuestionMids(midnight: string) {

        const mids = await this.questionMidRepo.createQueryBuilder()
            .select([
                'question_mid AS mid'
            ])
            .where(`STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') = STR_TO_DATE(:midnight, '%Y-%m-%d %H:%i:%s')`, { midnight })
            .getRawMany();

        return mids
    };

    async getOffsetQuestionList(
        skip: number,
        take: number
    ) {

        const questionList = await this.questionRepo.find({
            skip,
            take,
            order: {
                'questionId': 'ASC'
            }
        });

        return questionList;

    };

    async getOffsetQuestionListCount(){

        const count = await this.questionRepo.query(`SELECT COUNT(*) AS count FROM question`);
        
        return count[0]?.count;
    };

    async getCursorQuestionList(
        take: number,
        cursorId?: number
    ){

        const questionList = await this.questionRepo.find({
            take,
            where: cursorId ? {
                questionId: MoreThan(cursorId)
            } : null as unknown as FindOptionsWhere<QuestionEntity>,
            order: {
                questionId: 'ASC'
            }
        });

        return questionList

    }

    async insertQuestion(
        entityManager: EntityManager,
        body: PostQuestionDto,
        questionMid: string,
        createdAt: string,
        adminId: number
    ) {
        
        const insert = await entityManager.insert(QuestionEntity, {
            questionTitle: body.questionTitle,
            questionAnswer: body.questionAnswer,
            questionMid,
            questionQuantity: body.questionQuantity,
            questionType: body.questionType,
            questionCash: body.questionCash,
            createdAt,
            adminId
        });

        return insert;

    };

}