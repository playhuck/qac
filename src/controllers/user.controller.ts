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

@Controller('user')
export class UserController {

    constructor(private readonly service: UserService) {};

    @Get('/:id')
    async getUser(){

        const user = await this.service.getUser();
        
        return {
            user
        }
    }

    @Post('/sign-up')
    async signUp(
        
    ) {

        void await this.service.hello();

    };

}
