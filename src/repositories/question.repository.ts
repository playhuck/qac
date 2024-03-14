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
import { TQuestion } from "@models/types/t.question";

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
                DATE_ADD(STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) > STR_TO_DATE(:previousMidnight, '%Y-%m-%d %H:%i:%s') AND
                DATE_ADD(STR_TO_DATE(qu.created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 9 HOUR) < STR_TO_DATE(:nextMidnight, '%Y-%m-%d %H:%i:%s')
            `, { previousMidnight, nextMidnight }).
            andWhere(`qu.question_type =:type`, { type: 'allDayOnce' }).
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
                userId,
                questionType: 'threeHourOnce'
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
                questionMid,
                questionType: 'onlyOnce'
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

        // const result = await this.questionRepo.find({
        //     take,
        //     where: cursorId ? {
        //         questionId: MoreThan(cursorId)
        //     } : null as unknown as FindOptionsWhere<QuestionEntity>,
        //     order: {
        //         questionId: 'ASC'
        //     }
        // });

        const result = await this.questionRepo.query(
            `SELECT q.question_id
                FROM question AS q
                LEFT JOIN (
                    SELECT question_mid AS qMid
                    FROM question_user_list
                    WHERE user_id = ?
                        AND (
                            (STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')
                            AND STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s'))
                            OR (DATE_ADD(STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s'), INTERVAL 3 HOUR) < DATE_ADD(NOW(), INTERVAL 3 HOUR))
                        )
                    GROUP BY question_mid
                ) AS qu ON q.mid = qu.qMid
                WHERE q.type IN ('allDayOnce', 'threeHourOnce', 'onlyOnce')
                    AND (
                        (q.type = 'allDayOnce' AND qu.qMid IS NULL)
                        OR (q.type = 'threeHourOnce' AND (qu.qMid IS NULL OR q.mid != qu.qMid))
                        OR q.type = 'onlyOnce'
                    )
                    AND q.question_id > ?
                GROUP BY q.question_id
                ORDER BY q.question_id ASC
                LIMIT ?;`, [userId, previousMidnight, nextMidnight, cursorId, take]
        );

        // console.log(result);
        

        return result

    }

    async test(
        take: number,
        userId: number,
        previousMidnight: string,
        nextMidnight: string,
        cursorId?: number
    ) {
        // •	Questions 목록을 조회할 때에는 아래 조건을 만족해야함
        // •	여러 Questions가 동일한 mid값을 가질 수 있다.
        // •	타입1: 한 user는 동일한 mid값을 가진 question에 대해 하루에 한번만 참여가 가능하다
        // •	타입2: 한 user는 동일한 mid값을 가진 question에 대해 3시간에 한 번 참여가 가능하다
        // •	타입3: 한 user는 동일한 mid값을 가진 question에 대해 기간에 관계 없이 한 번만 참여 가능하다
        // •	question은 전체 user에 대해 매일 정해진 quantity까지만 참여가 가능하다
        // •	조건을 만족하는 question이 3개 이상일 경우 3개까지만 반환한다
        // •	위 조건을 만족하는 question이 없는 경우 code에 1을 내려준다
        
        const targetCursor = cursorId ? cursorId : 1

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
                GROUP BY q.question_id
                ORDER BY q.question_id ASC
                LIMIT ?;
            `, [userId, previousMidnight, nextMidnight, targetCursor, take]
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
        questionType: TQuestion,
        isAnswerd: boolean,
        createdAt: string
    ){

        const insert = await entityManager.query(
            `INSERT INTO question_user_list (question_id, user_id, question_mid, question_type, is_answer, created_at) VALUES (?,?,?,?,?,?)`,
            [qusetionId, userId, questionMid, questionType, isAnswerd ? 1 : 0, createdAt]
        );

        return insert;
        
    }

}