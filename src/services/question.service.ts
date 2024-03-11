import { Injectable } from '@nestjs/common';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';

@Injectable()
export class QuestionService {

    constructor(
        private readonly db: DbUtils,

        private readonly bcrypt: BcryptProvider,
        private readonly jwt: JwtProvider

    ) { }

   
};
