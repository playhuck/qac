import { JwtAdminGuard } from '@common/guards/jwt.admin.guard';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';
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

@Controller('question')
export class QuestionController {

    constructor() {};

    @UseGuards(JwtAdminGuard)
    @Post('')
    async postQuestion(
        @Body() body: PostQuestionDto
    ){

        
    }

}
