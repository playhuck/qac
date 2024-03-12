import { Injectable } from '@nestjs/common';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';
import { PostQuestionDto } from '@dtos/questions/post.question.dto';

@Injectable()
export class QuestionService {

    constructor(
        private readonly db: DbUtils,

        private readonly bcrypt: BcryptProvider,
        private readonly jwt: JwtProvider

    ) { }

    async postQuestion(
        body: PostQuestionDto
    ) {

        await this.db.transaction(async() => {

        }, {
            body
        })
    }

   
};
