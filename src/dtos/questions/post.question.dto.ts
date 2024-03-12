import { IsNotEmptyNumber, IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";
import { TQuestion } from "@models/types/t.question";

export class PostQuestionDto {

    @IsNotEmptyString()
    questionTitle!: string;

    @IsNotEmptyString()
    questionAnswer!: string;

    @IsNotEmptyNumber()
    questionQuantity!: number;

    @IsNotEmptyString()
    questionType!: TQuestion;

    @IsNotEmptyNumber()
    questionCash!: number;

}