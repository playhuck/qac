import { AdminId } from '@common/decorators/get.admin.decorator';
import { JwtAdminGuard } from '@common/guards/jwt.admin.guard';
import { JwtUserGuard } from '@common/guards/jwt.user.guard';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';
import { QueryQuestionDto } from '@dtos/questions/query.question.dto';
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
import { QuestionService } from '@services/question.service';

@Controller('question')
export class QuestionController {

    constructor(private readonly service: QuestionService) {};

    @UseGuards(JwtAdminGuard)
    @Post('')
    async postQuestion(
        @Body() body: PostQuestionDto,
        @AdminId() adminId: number
    ){
        
        void await this.service.postQuestion(
            body,
            adminId
        );
        
    };

    @UseGuards(JwtUserGuard)
    @Get('/list/offset')
    async getOffsetQuestionList(
        @Query() query: QueryQuestionDto
    ){

        const questionList = await this.service.getOffsetQuestionList(
            query
        );

        return { questionList };

    }

    @UseGuards(JwtUserGuard)
    @Get('/list/cursor')
    async getCursorQuestionList(){}

}
