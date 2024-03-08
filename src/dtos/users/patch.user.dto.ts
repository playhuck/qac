import { IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";

export class PatchUserDto {

    @IsNotEmptyString()
    name!: string;

}