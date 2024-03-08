import { IsNotEmptyString } from "@common/decorators/cv.not.empty.decorator";
import { UserEntity } from "@entities/user.entity";
import { IsEmail } from "class-validator";

export class PostSignInDto implements
    Pick<UserEntity, 'email' | 'password'> {

    @IsNotEmptyString()
    @IsEmail()
    email!: string;

    @IsNotEmptyString()
    password!: string;

}