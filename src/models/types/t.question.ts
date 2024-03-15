import { PostAnswerQuestionDto } from "@dtos/questions/post.answer.question.dto";
import { PostQuestionDto } from "@dtos/questions/post.question.dto";
import { QuestionEntity } from "@entities/question.entity";
import { QuestionUserListEntity } from "@entities/question.user.list.entity";
import { EntityManager } from "typeorm";

type TQuestion = 'allDayOnce' | 'threeHourOnce' | 'onlyOnce' | 'montlyOnce';

type TQuestionTypeFunction = ((
    entityManager: EntityManager,
    userId: number,
    questionMid: string
) => Promise<void>);

type TQuestionQuantityLimit = Array<Pick<QuestionUserListEntity, 'questionId'>>;
type TQuestionLastAnswered = Array<Pick<QuestionUserListEntity, 'questionId' | 'createdAt'>>;

export {
    TQuestion,
    TQuestionTypeFunction,
    TQuestionQuantityLimit,
    TQuestionLastAnswered
}