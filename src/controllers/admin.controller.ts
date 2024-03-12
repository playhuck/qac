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
import { PostAdminSignUpDto } from '@dtos/admin/post.sign.up.dto';
import { PostAdminSignInDto } from '@dtos/admin/post.sign.in.dto';
import { AdminService } from '@services/admin.service';
import { KeyAdminGuard } from '@common/guards/key.admin.guard';

@UseGuards(KeyAdminGuard)
@Controller('admin')
export class AdminController {

    constructor(private readonly service: AdminService) {};

    @Post('/sign-up')
    async signUp(
        @Body() body: PostAdminSignUpDto
    ) {

        void await this.service.signUp(body);

    };

    @Post('/sign-in')
    async signIn(
        @Body() body: PostAdminSignInDto
    ) {

        const tokens = await this.service.signIn(body);

        return { tokens };
        
    };

}
