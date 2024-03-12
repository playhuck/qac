import { PostQuestionDto } from "@dtos/questions/post.question.dto";
import { EntityManager } from "typeorm";

type TQuestion = 'same' | 'similar' | 'alpha';

type TQuestionTypeFunction = ((
    entityManager: EntityManager,
    params : PostQuestionDto
) => Promise<void>)

export {
    TQuestion,
    TQuestionTypeFunction
}