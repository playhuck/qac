import { Injectable } from '@nestjs/common';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';
import { EntityManager, InsertResult } from 'typeorm';
import { AdminRepository } from '@repositories/admin.repository';
import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { TQuestion, TQuestionTypeFunction } from '@models/types/t.question';
import { QuestionRepository } from '@repositories/question.repository';
import { DayjsProvider } from '@providers/dayjs.provider';
import { RandomProvider } from '@providers/random.provider';
import { EQuestionType } from '@models/enums/e.question';
import { QueryQuestionDto } from '@dtos/questions/query.question.dto';
import { CommonUtil } from '@utils/common.util';
import { QueryCursorQuestionDto } from '@dtos/questions/query.cursor.question.dto';
import { ConfigService } from '@nestjs/config';
import { PostAnswerQuestionDto } from '@dtos/questions/post.answer.question.dto';
import { ParamQuestionDto } from '@dtos/questions/param.question.dto';
import { QuestionEntity } from '@entities/question.entity';
import { UserRepository } from '@repositories/user.repository';
import { ResultSetHeader } from 'mysql2';

@Injectable()
export class QuestionService {

    typeFunction: {
        [K in TQuestion]: TQuestionTypeFunction
    }

    constructor(

        private readonly db: DbUtils,
        private readonly util: CommonUtil,

        private readonly jwt: JwtProvider,
        private readonly dayjs: DayjsProvider,
        private readonly random: RandomProvider,

        private readonly adminRepo: AdminRepository,
        private readonly questionRepo: QuestionRepository,
        private readonly userRepo: UserRepository

    ) {
        this.typeFunction = {
            'allDayOnce': this.allDayOnceQuestion.bind(this),
            'threeHourOnce': this.threeHourOnceQuestion.bind(this),
            'onlyOnce': this.onlyOnceQuestion.bind(this)
        }
    }

    async postQuestion(
        body: PostQuestionDto,
        adminId: number
    ) {

        await this.db.transaction(
            async (entityManager: EntityManager, args) => {

                const { adminId, body } = args;
                const createdAt = this.dayjs.getDatetimeByOptions('YYYY-MM-DD HH:mm:ss');

                if (!EQuestionType[body.questionType]) {
                    throw new CustomException(
                        "문제 타입 불일치",
                        ECustomExceptionCode["USER-001"],
                        400
                    )
                };

                const midnight = this.dayjs.getNextDayMidnight();
                const getMids = await this.questionRepo.getQuestionMids(midnight);
                const { mid }: {
                    mid: string
                } = await this.random.getRandomValueFromArray(getMids);


                const postQ = await this.questionRepo.insertQuestion(
                    entityManager,
                    body,
                    mid,
                    createdAt,
                    adminId
                );

                if (postQ.generatedMaps.length !== 1) {
                    throw new CustomException(
                        "Question 생성 실패",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    )
                };


            }, {
            body,
            adminId
        })
    };

    async postAnswerQuestion(
        userId: number,
        body: PostAnswerQuestionDto,
        param: ParamQuestionDto
    ) {
        
        await this.db.transaction(
            async (entityManager: EntityManager, args) => {

                const { userId, body, param } = args;
                const { questionId } = param;
                const { questionAnswer: inputAnswer } = body;
                const createdAt = this.dayjs.getDatetimeByOptions('YYYY-MM-DD HH:mm:ss');

                const question = await this.questionRepo.getQuestionById(questionId);
                if (!question) {
                    throw new CustomException(
                        "문제를 찾을 수 없음",
                        ECustomExceptionCode["QUESTION-002"],
                        403
                    )
                };
                const {
                    questionType,
                    questionQuantity,
                    questionAnswer: originAnswer,
                    questionCash,
                    questionMid
                } = question;

                const questionQuantityLimit = await this.questionRepo.getQuestionQuantityLimit(
                    entityManager,
                    questionId
                );
                if (questionQuantityLimit.length >= questionQuantity) {
                    throw new CustomException(
                        "특정 문제 별 일일 이용한도 초과",
                        ECustomExceptionCode["QUESTION-003"],
                        400
                    )
                };

                await this.typeFunction[questionType](
                    entityManager,
                    userId,
                    questionMid
                );

                const isAnswerd = originAnswer !== inputAnswer ? false : true;

                const insertQuestionUser = await this.questionRepo.insertQusetionUser(
                    entityManager,
                    questionId,
                    userId,
                    questionMid,
                    questionType,
                    isAnswerd,
                    createdAt
                ) as ResultSetHeader;
                if (insertQuestionUser.affectedRows !== 1) {
                    throw new CustomException(
                        "정답 반영 실패",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    );
                }

                const user = await this.userRepo.getEmUserById(entityManager, userId);

                const calCash = user!.cash += questionCash;

                const updateUserCash = await this.userRepo.updateUserCash(
                    entityManager,
                    userId,
                    calCash
                );

                if (updateUserCash.affected !== 1) {
                    throw new CustomException(
                        "유저 Cash 반영 실패",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    );
                };

            }, {
            userId, body, param
        })
    }

    async allDayOnceQuestion(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ) {

        const previousMidnight = this.dayjs.getNextDayMidnight();
        const nextMidnight = this.dayjs.addTime(previousMidnight, 24, 'hour', 'YYYY-MM-DD HH:mm:ss');

        const isAllDayOnce = await this.questionRepo.getAllDayOnceByMid(
            entityManager,
            userId,
            questionMid,
            previousMidnight,
            nextMidnight
        );

        if (isAllDayOnce.length > 0) {
            throw new CustomException(
                "특정 MID 별 일일 이용한도 초과",
                ECustomExceptionCode["MID-001"],
                400
            )
        };

    }

    async threeHourOnceQuestion(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ) {

        const getLastAnsweredMid = await this.questionRepo.getLastAnsweredMid(
            entityManager,
            questionMid,
            userId
        );
        if (getLastAnsweredMid.length === 0) return true;
        else {

            const { createdAt } = getLastAnsweredMid[0];
            const lastDiffTime = this.dayjs.getDifftime(createdAt, 'hours');
            if (lastDiffTime < 3) {
                throw new CustomException(
                    "특정 MID 별 3시간 별 이용한도 초과",
                    ECustomExceptionCode["MID-002"],
                    400
                )
            };

        }

    };

    async onlyOnceQuestion(
        entityManager: EntityManager,
        userId: number,
        questionMid: string
    ) {

        const getOnlyOnceByMid = await this.questionRepo.getOnlyOnceByMid(
            entityManager,
            userId,
            questionMid
        );
        if (getOnlyOnceByMid) {
            throw new CustomException(
                "특정 MID 별 전체 이용한도 초과",
                ECustomExceptionCode["MID-003"],
                400
            )
        }
    };

    async getOffsetQuestionList(
        query: QueryQuestionDto
    ) {

        const { page, pageCount: take } = query;
        const skip = await this.util.skipedItem(page, take);

        const questionList = await this.questionRepo.getOffsetQuestionList(
            skip,
            take
        );

        return questionList
    };

    async getOffsetQuestionListCount() {

        const questionCount = await this.questionRepo.getOffsetQuestionListCount();

        const pages = Math.ceil(questionCount / 15);

        return pages
    };

    async getCursorQuetionList(
        query: QueryCursorQuestionDto,
        userId: number
    ) {

        const { pageCount: take, cursorId } = query;
        const previousMidnight = this.dayjs.getNextDayMidnight();
        const nextMidnight = this.dayjs.addTime(previousMidnight, 24, 'hour', 'YYYY-MM-DD HH:mm:ss');

        const decrypteCursor = cursorId ? this.jwt.verifyCursorToken(
            cursorId
        ) : undefined;

        const questionList = await this.questionRepo.getCursorQuestionList(
            take,
            userId,
            previousMidnight,
            nextMidnight,
            decrypteCursor ? decrypteCursor['cursorId'] : undefined
        );

        if(questionList.length === 0) {
            throw new CustomException(
                "풀 수 있는 문제 미존재",
                ECustomExceptionCode["QUESTION-005"],
                400
            )
        };

        const isNextCursor = questionList.length > 0 ? questionList[questionList.length - 1].questionId : null;

        const encrypteCursor = isNextCursor ? this.jwt.signCursorAccessToken(
            {
                type: 'CursorToken',
                cursorId: isNextCursor
            }
        ) : undefined;

        return encrypteCursor ? {
            encrypteCursor,
            questionList
        } : {
            questionList
        }

    };


};
