import { 
    Body, 
    Controller, 
    Get, 
    Param, 
    Patch, 
    Post, 
    Query, 
    UseGuards
} from '@nestjs/common';

import { UserService } from '@services/user.service';
import { JwtUserGuard } from '@common/guards/jwt.user.guard';
import { PostSignUpDto } from '@dtos/users/post.sign.up.dto';
import { PostSignInDto } from '@dtos/users/post.sign.in.dto';

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

    @Patch('/update/:id')
    async userUpdate() {};

    @Patch('/delete/:id')
    async userDelete() {};

}
