import { IsNotEmptyNumber, IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";
import { IsOptionalString } from "@common/decorators/cv.optional.decorator";

export class QueryCursorQuestionDto {

    @IsNotEmptyNumber()
    pageCount!: number;
    
    @IsOptionalString()
    cursorId?: string;
}