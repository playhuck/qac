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
import { TQuestion, TQuestionLastAnswered, TQuestionQuantityLimit } from "@models/types/t.question";

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
    ) {

        const quantityLimit = await entityManager.find(QuestionUserListEntity, {
            where: {
                questionId
            },
            select: {
                questionId: true
            }
        }) as TQuestionQuantityLimit;

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
                DATE_ADD(STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) > STR_TO_DATE(:previousMidnight, '%Y-%m-%d %H:%i:%s') AND
                DATE_ADD(STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) < STR_TO_DATE(:nextMidnight, '%Y-%m-%d %H:%i:%s')
            `, { previousMidnight, nextMidnight }).
            andWhere(`qu.question_type =:type`, { type: 'allDayOnce' }).
            getRawMany() as TQuestionQuantityLimit;

        return result;

    };

    async getLastAnsweredMid(
        entityManager: EntityManager,
        questionMid: string,
        userId: number
    ) {

        const result = await entityManager.find(QuestionUserListEntity, {
            select: {
                createdAt: true,
                questionId: true
            },
            where: {
                questionMid,
                userId,
                questionType: 'threeHourOnce'
            },
            take: 1,
            order: {
                'createdAt': 'DESC'
            }
        }) as TQuestionLastAnswered;

        return result;
    };

    async getOnlyOnceByMid(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ) {

        const result = await entityManager.findOne(QuestionUserListEntity, {
            where: {
                userId,
                questionMid,
                questionType: 'onlyOnce'
            }
        });

        return result;
    };

    async getMonthlyOnceByMid(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ) {

        const result = await entityManager.
            createQueryBuilder().
            select([
                'question_id as questionId',
                'created_at as createdAt'
            ]).
            where(`user_id =:userId`, { userId }).
            andWhere(`question_mid =:questionMid`, { questionMid }).
            andWhere(`question_type =:type`, { type: 'montlyOnce' as TQuestion }).
            andWhere(`STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s')`).
            orderBy(`created_at`, 'DESC').
            take(1).
            getRawMany() as TQuestionLastAnswered;

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

        const targetCursor = cursorId ? cursorId : 1

        const ceilResult = await this.questionRepo.query(
            `
                SELECT q.question_id
                FROM question AS q
                LEFT JOIN (
                    SELECT question_mid AS qMid, question_type
                    FROM question_user_list
                    WHERE user_id = ?
                        AND (
                            (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))
                            AND (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))
                            AND question_type = 'allDayOnce'
                        )
                        OR (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 3 HOUR) < DATE_ADD(NOW(), INTERVAL 3 HOUR) AND question_type = 'threeHourOnce')
                        OR question_type = 'onlyOnce'
                    GROUP BY question_mid, question_type
                ) AS qu ON q.mid = qu.qMid AND q.type = qu.question_type
                WHERE (
                    q.type = 'allDayOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                )
                    OR (
                        q.type = 'threeHourOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                    )
                    OR (
                        q.type = 'onlyOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                    )
                    AND q.question_id > ?
                    AND CEIL(q.quantity / 2) > q.take 
                GROUP BY q.question_id
                ORDER BY q.question_id ASC
                LIMIT ?;
            `, [userId, previousMidnight, nextMidnight, targetCursor, 3]
        );

        if (ceilResult.length === 0) {
            const result = await this.questionRepo.query(
                `
                    SELECT q.question_id
                    FROM question AS q
                    LEFT JOIN (
                        SELECT question_mid AS qMid, question_type
                        FROM question_user_list
                        WHERE user_id = ?
                            AND (
                                (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))
                                AND (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))
                                AND question_type = 'allDayOnce'
                            )
                            OR (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 3 HOUR) < DATE_ADD(NOW(), INTERVAL 3 HOUR) AND question_type = 'threeHourOnce')
                            OR question_type = 'onlyOnce'
                        GROUP BY question_mid, question_type
                    ) AS qu ON q.mid = qu.qMid AND q.type = qu.question_type
                    WHERE (
                        q.type = 'allDayOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                    )
                        OR (
                            q.type = 'threeHourOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                        )
                        OR (
                            q.type = 'onlyOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid)
                        )
                        AND q.question_id > ?
                        AND CEIL(q.quantity / 2) > q.take 
                    GROUP BY q.question_id
                    ORDER BY q.question_id ASC
                    LIMIT ?;
                `, [userId, previousMidnight, nextMidnight, targetCursor, 3]
            );

            return result;
        };

        return ceilResult

    };

    async updateQuestionTake(
        entityManager: EntityManager,
        questionId: number,
        questionTake: number
    ) {

        const update = await entityManager.update(QuestionEntity, {
            questionId
        }, {
            questionTake
        });

        return update;

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
        questionType: TQuestion,
        isAnswerd: boolean,
        createdAt: string
    ) {

        const insert = await entityManager.query(
            `INSERT INTO question_user_list (question_id, user_id, question_mid, question_type, is_answer, created_at) VALUES (?,?,?,?,?,?)`,
            [qusetionId, userId, questionMid, questionType, isAnswerd ? 1 : 0, createdAt]
        );

        return insert;

    }

}