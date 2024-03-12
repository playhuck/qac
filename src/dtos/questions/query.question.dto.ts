import { IsNotEmptyNumber } from "@common/decorators/cv.not.empty.decorator";
import { Transform } from "class-transformer";

export class QueryQuestionDto {

    @Transform(v => parseInt(v.value))
    @IsNotEmptyNumber()
    page!: number;

    @Transform(v => parseInt(v.value))
    @IsNotEmptyNumber()
    pageCount!: number;
}