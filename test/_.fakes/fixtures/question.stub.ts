import { ParamQuestionDto } from "@dtos/questions/param.question.dto";
import { PostAnswerQuestionDto } from "@dtos/questions/post.answer.question.dto";
import { AdminEntity } from "@entities/admin.entity";
import { QuestionEntity } from "@entities/question.entity";
import { TQuestion } from "@models/types/t.question";

export class QuestionStub {

    get postAnswerDto () {
        const body: PostAnswerQuestionDto = {
            questionAnswer: 'answer'
        };
        return body;
    };

    get paramQuestionDto () {
        const param: ParamQuestionDto = {
            questionId: 0
        };
        return param;
    };

    get userId(){
        return 0
    }

    async mockQuestion (
        questionAnswer: string,
        questionType: TQuestion,
        createdAt: string
    ): Promise<QuestionEntity> {

        return {
            questionAnswer,
            questionCash: 500,
            questionId: 0,
            questionMid: 'mid',
            questionQuantity: 3,
            questionTake: 3,
            questionTitle: 'question',
            questionType,
            questionUserList: [],
            createdAt,
            adminId: 1,
            admin: new AdminEntity()
        };
    }

}