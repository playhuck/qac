import { IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";

export class PostSignUpDto {

    @IsNotEmptyString()
    email!: string;

    @IsNotEmptyString()
    name!: string;

    @IsNotEmptyString()
    password!: string;

    @IsNotEmptyString()
    passwordCheck!: string;

};