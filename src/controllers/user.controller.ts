import { 
    Body, 
    Controller,
    Param, 
    Patch, 
    Post,
    UseGuards
} from '@nestjs/common';

import { UserService } from '@services/user.service';
import { JwtUserGuard } from '@common/guards/jwt.user.guard';
import { PostSignUpDto } from '@dtos/users/post.sign.up.dto';
import { PostSignInDto } from '@dtos/users/post.sign.in.dto';
import { UserParamDto } from '@dtos/users/user.param.dto';
import { PatchUserDto } from '@dtos/users/patch.user.dto';

@Controller('user')
export class UserController {

    constructor(private readonly service: UserService) {};

    @Post('/sign-up')
    async signUp(
        @Body() body: PostSignUpDto
    ) {

        void await this.service.signUp(body);

    };

    @Post('/sign-in')
    async signIn(
        @Body() body: PostSignInDto
    ) {

        const tokens = await this.service.signIn(body);

        return { tokens };
        
    };

    @UseGuards(JwtUserGuard)
    @Patch('/update/:id')
    async userUpdate(
        @Param() param: UserParamDto,
        @Body() body: PatchUserDto
    ) {

        void await this.service.update(
            param,
            body
        );

    };

    @UseGuards(JwtUserGuard)
    @Patch('/delete/:id')
    async userDelete(
        @Param() param: UserParamDto
    ) {

        void await this.service.remove(
            param
        );
        
    };

}
