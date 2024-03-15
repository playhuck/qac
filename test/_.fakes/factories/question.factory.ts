import { DbUtils } from "@utils/db.utils"
import { createMock } from "../mock"
import { CommonUtil } from "@utils/common.util"
import { JwtProvider } from "@providers/jwt.provider"
import { DayjsProvider } from "@providers/dayjs.provider"
import { RandomProvider } from "@providers/random.provider"
import { AdminRepository } from "@repositories/admin.repository"
import { QuestionRepository } from "@repositories/question.repository"
import { UserRepository } from "@repositories/user.repository"
import { DataSource } from "typeorm"

export class QuestionFactory {

    static get provider () {

        return [
            // {
            //     provide: DbUtils,
            //     useValue: createMock()
            // },
            {
                provide: CommonUtil,
                useValue: createMock()
            },
            {
                provide: JwtProvider,
                useValue: createMock()
            },
            // {
            //     provide: DayjsProvider,
            //     useValue: createMock()
            // },
            {
                provide: RandomProvider,
                useValue: createMock()
            },
            {
                provide: AdminRepository,
                useValue: createMock()
            },
            {
                provide: QuestionRepository,
                useValue: createMock()
            },
            {
                provide: UserRepository,
                useValue: createMock()
            },
            {
                provide: DataSource,
                useValue: createMock()
            }
        ]
    }

}