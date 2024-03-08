import { IsNotEmptyNumber } from "@common/decorators/cv.not.empty.decorator";

export class UserParamDto {

    @IsNotEmptyNumber()
    userId!: number;

}