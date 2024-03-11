import { QuestionController } from '@controllers/question.controller';
import { Module } from '@nestjs/common';
import { QuestionService } from '@services/question.service';

@Module({
    providers: [QuestionService],
    controllers: [QuestionController]
})
export class QuestionModule {}
