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

    async getQuestionById(questionId: number) {

        const result = await this.questionRepo.findOne({
            where: {
                questionId
            }
        });

        return result;
    }

    async getQuestionMids(midnight: string) {

        const result = await this.questionMidRepo.createQueryBuilder()
            .select([
                'question_mid AS mid'
            ])
            .where(`STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') = STR_TO_DATE(:midnight, '%Y-%m-%d %H:%i:%s')`, { midnight })
            .getRawMany();

        return result
    };

    async getQuestionQuantityLimit(
        entityManager: EntityManager,
        questionId: number
    ){
        
        const quantityLimit = await entityManager.find(QuestionUserListEntity, {
            where: {
                questionId
            },
            select: {
                questionId: true
            }
        });

        return quantityLimit;
    }

    async getAllDayOnceByMid(
        entityManager: EntityManager,
        userId: number,
        questionMid: string,
        previousMidnight: string,
        nextMidnight: string
    ) {

        const result = await entityManager.
            createQueryBuilder(QuestionUserListEntity, 'qu').
            select(['qu.question_id as questionId']).
            where(`qu.question_mid =:questionMid`, { questionMid }).
            andWhere(`qu.user_id =:userId`, { userId }).
            andWhere(`
                STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s') > STR_TO_DATE(:previousMidnight, '%Y-%m-%d %H:%i:%s') AND
                STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s') < STR_TO_DATE(:nextMidnight, '%Y-%m-%d %H:%i:%s')
            `, { previousMidnight, nextMidnight }).
            getRawMany();

        return result;

    };

    async getLastAnsweredMid(
        entityManager: EntityManager,
        questionMid: string,
        userId: number
    ){

        const result = await entityManager.find(QuestionUserListEntity, {
            where: {
                questionMid,
                userId
            },
            take: 1,
            order: {
                'createdAt': 'DESC'
            }
        });

        return result;
    };

    async getOnlyOnceByMid(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ){

        const result = await entityManager.findOne(QuestionUserListEntity, {
            where: {
                userId,
                questionMid
            }
        });

        return result;
    }

    async getOffsetQuestionList(
        skip: number,
        take: number
    ) {

        const result = await this.questionRepo.find({
            skip,
            take,
            order: {
                'questionId': 'ASC'
            }
        });

        return result;

    };

    async getOffsetQuestionListCount() {

        const result = await this.questionRepo.query(`SELECT COUNT(*) AS count FROM question`);

        return result[0]?.count;
    };

    async getCursorQuestionList(
        take: number,
        userId: number,
        previousMidnight: string,
        nextMidnight: string,
        cursorId?: number
    ) {

        const result = await this.questionRepo.find({
            take,
            where: cursorId ? {
                questionId: MoreThan(cursorId)
            } : null as unknown as FindOptionsWhere<QuestionEntity>,
            order: {
                questionId: 'ASC'
            }
        });

        return result

    }

    async test(
        take: number,
        userId: number,
        previousMidnight: string,
        nextMidnight: string,
        cursorId?: number
    ) {

        const where = cursorId ? `q.question_id > :cursorId` : `1 =:cursorId`
        const condition = cursorId ? { cursorId } : { cursorId: 1 }

        const result = await this.questionRepo.query(
            `
                SELECT q.question_id FROM question as q LEFT JOIN (
                    SELECT question_id as qId FROM question_user_list WHERE user_id = ? AND
                    STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s') AND
                    STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')
                ) as qu ON q.question_id != qu.qId
            `, [userId, previousMidnight, nextMidnight]
        );


        return result

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

    async insertQusetionUser(
        entityManager: EntityManager,
        qusetionId: number,
        userId: number,
        questionMid: string,
        isAnswerd: boolean,
        createdAt: string
    ){

        const insert = await entityManager.query(
            `INSERT INTO question_user_list (question_id, user_id, question_mid, is_answer, created_at) VALUES (?,?,?,?,?)`,
            [qusetionId, userId, questionMid, isAnswerd ? 1 : 0, createdAt]
        );

        return insert;
        
    }

}