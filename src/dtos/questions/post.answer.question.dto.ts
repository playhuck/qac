import { IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";

export class PostAnswerQuestionDto {

    @IsNotEmptyString()
    questionAnswer!: string;

}