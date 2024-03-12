import { IsNotEmptyNumber } from "@common/decorators/cv.not.empty.decorator";

export class ParamQuestionDto {

    @IsNotEmptyNumber()
    questionId!: number;

};