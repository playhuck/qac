import { AdminId } from '@common/decorators/get.admin.decorator';
import { JwtAdminGuard } from '@common/guards/jwt.admin.guard';
import { JwtUserGuard } from '@common/guards/jwt.user.guard';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';
import { QueryCursorQuestionDto } from '@dtos/questions/query.cursor.question.dto';
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

    constructor(private readonly service: QuestionService) { };

    @UseGuards(JwtAdminGuard)
    @Post('')
    async postQuestion(
        @Body() body: PostQuestionDto,
        @AdminId() adminId: number
    ) {

        void await this.service.postQuestion(
            body,
            adminId
        );

    };

    @UseGuards(JwtUserGuard)
    @Get('/offset/list')
    async getOffsetQuestionList(
        @Query() query: QueryQuestionDto
    ) {

        const questionList = await this.service.getOffsetQuestionList(
            query
        );

        return { questionList };

    };

    @UseGuards(JwtUserGuard)
    @Get('/offset/count')
    async getOffsetQuestionListCount() {

        const qusetionPages = await this.service.getOffsetQuestionListCount();

        return { qusetionPages };

    }

    @UseGuards(JwtUserGuard)
    @Get('/cursor/list')
    async getCursorQuestionList(
        @Query() query: QueryCursorQuestionDto
    ) {

        const questionList = await this.service.getCursorQuetionList(
            query
        );

        return questionList?.encrypteCursor ? {
            questionList: questionList.questionList,
            cursorId: questionList.encrypteCursor
        } : {
            questionList: questionList.questionList
        };
    }

}
