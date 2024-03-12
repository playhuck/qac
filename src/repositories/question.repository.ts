import { Injectable } from "@nestjs/common";
import { Repository, DataSource, EntityManager } from "typeorm";

import { UserEntity } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSignUpDto } from "@dtos/users/post.sign.up.dto";
import { AdminEntity } from "@entities/admin.entity";
import { PostQuestionDto } from "@dtos/questions/post.question.dto";
import { QuestionEntity } from "@entities/question.entity";
import { QuestionMidEntity } from "@entities/question.mid.entity";
import { QuestionUserListEntity } from "@entities/question.user.list.entity";

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