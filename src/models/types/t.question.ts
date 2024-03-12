import { PostAnswerQuestionDto } from "@dtos/questions/post.answer.question.dto";
import { PostQuestionDto } from "@dtos/questions/post.question.dto";
import { QuestionEntity } from "@entities/question.entity";
import { EntityManager } from "typeorm";

type TQuestion = 'allDayOnce' | 'threeHourOnce' | 'onlyOnce';

type TQuestionTypeFunction = ((
    entityManager: EntityManager,
    userId: number,
    questionMid: string
) => Promise<void>)

export {
    TQuestion,
    TQuestionTypeFunction
}