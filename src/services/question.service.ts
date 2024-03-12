import { Injectable } from '@nestjs/common';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';
import { EntityManager } from 'typeorm';
import { AdminRepository } from '@repositories/admin.repository';
import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { TQuestion, TQuestionTypeFunction } from '@models/types/t.question';
import { QuestionRepository } from '@repositories/question.repository';
import { DayjsProvider } from '@providers/dayjs.provider';
import { RandomProvider } from '@providers/random.provider';
import { EQuestionType } from '@models/enums/e.question';

@Injectable()
export class QuestionService {

    typeFunction: {
        [K in TQuestion]: TQuestionTypeFunction
    }

    constructor(
        private readonly db: DbUtils,

        private readonly dayjs: DayjsProvider,
        private readonly random: RandomProvider,

        private readonly adminRepo: AdminRepository,
        private readonly questionRepo: QuestionRepository

    ) {
        this.typeFunction = {
            'same': this.sameQuestion.bind(this),
            'similar': this.similarQuestion.bind(this),
            'alpha': this.alphaQuestion.bind(this)
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

                if(!EQuestionType[body.questionType]){
                    throw new CustomException(
                        "문제 타입 불일치",
                        ECustomExceptionCode["USER-001"],
                        400
                    )
                };

                const midnight = this.dayjs.getNextDayMidnight();
                const getMids = await this.questionRepo.getQuestionMids(midnight);
                const { mid } : {
                    mid: string
                }= await this.random.getRandomValueFromArray(getMids);
                
                const postQ = await this.questionRepo.insertQuestion(
                    entityManager,
                    body,
                    mid,
                    createdAt,
                    adminId
                );

                if(postQ.generatedMaps.length !== 1) {
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

    async sameQuestion(
        entityManager: EntityManager,
        body: PostQuestionDto
    ) { }

    async similarQuestion(
        entityManager: EntityManager,
        body: PostQuestionDto
    ) { }

    async alphaQuestion(
        entityManager: EntityManager,
        body: PostQuestionDto
    ) { }


};
