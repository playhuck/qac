import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager, Repository, UpdateResult } from 'typeorm';

import { DayjsProvider } from '@providers/dayjs.provider';
import { QuestionFactory } from '../_.fakes/factories/question.factory';
import { QuestionService } from '@services/question.service';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { QuestionRepository } from '@repositories/question.repository';
import { PostAnswerQuestionDto } from '@dtos/questions/post.answer.question.dto';
import { CustomException } from '@common/exception/custom.exception';
import { DbUtils } from '@utils/db.utils';
import { QuestionStub } from '../_.fakes/fixtures/question.stub';
import { ParamQuestionDto } from '@dtos/questions/param.question.dto';
import { QuestionEntity } from '@entities/question.entity';
import { TQuestionLastAnswered, TQuestionQuantityLimit } from '@models/types/t.question';
import { QuestionUserListEntity } from '@entities/question.user.list.entity';
import { ResultSetHeader } from 'mysql2';
import { UserRepository } from '@repositories/user.repository';

describe('Question Unit Test', () => {

    let dataSource: DataSource;
    let entityManager: EntityManager;

    let dayjs: DayjsProvider;

    let service: QuestionService;
    let questionRepo: QuestionRepository;
    let userRepo: UserRepository;

    let questionStub: QuestionStub;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                DbUtils,
                DayjsProvider,
                ...QuestionFactory.provider
            ]
        }).compile();

        dataSource = module.get<DataSource>(DataSource);
        entityManager = dataSource.createEntityManager();

        service = module.get<QuestionService>(QuestionService);
        questionRepo = module.get<QuestionRepository>(QuestionRepository);
        userRepo = module.get<UserRepository>(UserRepository);

        dayjs = new DayjsProvider();
        questionStub = new QuestionStub();

    });

    it("Report Service Property Should Be Define", async () => {

        expect(Object.keys(service).length).toBe(9);

        expect(service['dayjs']).toBeDefined();
        expect(service['db']).toBeDefined();
        expect(service['jwt']).toBeDefined();
        expect(service['util']).toBeDefined();
        expect(service['userRepo']).toBeDefined();
        expect(service['random']).toBeDefined();
        expect(service['questionRepo']).toBeDefined();
        expect(service['adminRepo']).toBeDefined();

    });

    describe("문제 풀이", () => {

        let createdAt: string;
        let body: PostAnswerQuestionDto
        let param: ParamQuestionDto
        let userId: number
        
        let mockQuestion: QuestionEntity;

        beforeAll(async() => {

            createdAt = dayjs.getDatetimeByOptions('YYYY-MM-DD HH:mm:ss');
            body = questionStub.postAnswerDto;
            param = questionStub.paramQuestionDto;
            userId = questionStub.userId;
            mockQuestion = await questionStub.mockQuestion(
                'answer',
                'allDayOnce',
                createdAt
            );

        });

        afterEach(async() => {

            jest.restoreAllMocks();

        })

        it(`question 미존재:${ECustomExceptionCode['QUESTION-002']}`, async () => {

            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(null);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {

                if (e instanceof CustomException) expect(e['message']).toBe('문제를 찾을 수 없음');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['QUESTION-002']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(403);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`특정 문제 일일 한도 초과:${ECustomExceptionCode['QUESTION-003']}`, async()=> {

            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}, {}] as TQuestionQuantityLimit
            );

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {

                if (e instanceof CustomException) expect(e['message']).toBe('특정 문제 별 일일 이용한도 초과');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['QUESTION-003']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(400);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`특정 MID 별 일일 이용한도 초과:${ECustomExceptionCode['MID-001']}`, async()=> {

            mockQuestion.questionType = 'allDayOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getAllDayOnceByMidSpyOn = jest.spyOn(questionRepo, 'getAllDayOnceByMid').mockResolvedValue([{}] as TQuestionQuantityLimit)

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('특정 MID 별 일일 이용한도 초과');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['MID-001']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(400);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getAllDayOnceByMidSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`특정 MID 별 3시간 별 이용한도 초과:${ECustomExceptionCode['MID-002']}`, async()=> {

            mockQuestion.questionType = 'threeHourOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getLastAnsweredMidSpyOn = jest.spyOn(questionRepo, 'getLastAnsweredMid').mockResolvedValue([{
                questionId: 0,
                createdAt: dayjs.addTime(createdAt, -2, 'hour', 'YYYY-MM-DD HH:mm:ss')
            }] as TQuestionLastAnswered);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('특정 MID 별 3시간 별 이용한도 초과');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['MID-002']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(400);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getLastAnsweredMidSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`특정 MID 별 3시간 별 이용한도 초과:${ECustomExceptionCode['MID-002']}`, async()=> {

            mockQuestion.questionType = 'threeHourOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getLastAnsweredMidSpyOn = jest.spyOn(questionRepo, 'getLastAnsweredMid').mockResolvedValue([{
                questionId: 0,
                createdAt: dayjs.addTime(createdAt, -2, 'hour', 'YYYY-MM-DD HH:mm:ss')
            }] as TQuestionLastAnswered);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('특정 MID 별 3시간 별 이용한도 초과');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['MID-002']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(400);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getLastAnsweredMidSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`특정 MID 별 전체 이용한도 초과:${ECustomExceptionCode['MID-003']}`, async()=> {

            mockQuestion.questionType = 'onlyOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getOnlyOnceByMidSpyOn = jest.spyOn(questionRepo, 'getOnlyOnceByMid').mockResolvedValue({} as QuestionUserListEntity);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('특정 MID 별 전체 이용한도 초과');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['MID-003']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(400);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getOnlyOnceByMidSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`정답 반영 실패:${ECustomExceptionCode['AWS-RDS-EXCEPTION']}`, async()=> {

            mockQuestion.questionType = 'onlyOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getOnlyOnceByMidSpyOn = jest.spyOn(questionRepo, 'getOnlyOnceByMid').mockResolvedValue(null);
            const insertQusetionUserSpyOn = jest.spyOn(questionRepo, 'insertQusetionUser').mockResolvedValue({affectedRows: 0} as ResultSetHeader);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('정답 반영 실패');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['AWS-RDS-EXCEPTION']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(500);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getOnlyOnceByMidSpyOn).toHaveBeenCalledTimes(1);
            expect(insertQusetionUserSpyOn).toHaveBeenCalledTimes(1);

        });

        it(`유저 Cash 반영 실패:${ECustomExceptionCode['AWS-RDS-EXCEPTION']}`, async()=> {

            mockQuestion.questionType = 'onlyOnce';
            const questionIdSpyOn = jest.spyOn(questionRepo, 'getQuestionById').mockResolvedValue(mockQuestion);
            const getQuestionQuantityLimitSpyOn = jest.spyOn(questionRepo, 'getQuestionQuantityLimit').mockResolvedValue(
                [{}, {}] as TQuestionQuantityLimit
            );
            const getOnlyOnceByMidSpyOn = jest.spyOn(questionRepo, 'getOnlyOnceByMid').mockResolvedValue(null);
            const insertQusetionUserSpyOn = jest.spyOn(questionRepo, 'insertQusetionUser').mockResolvedValue({affectedRows: 1} as ResultSetHeader);
            const updateUserCashSpyOn = jest.spyOn(userRepo, 'updateUserCash').mockResolvedValue({ affected : 0 } as UpdateResult);

            try {

                await service.postAnswerQuestion(userId, body, param); 

            } catch (e) {
                
                if (e instanceof CustomException) expect(e['message']).toBe('유저 Cash 반영 실패');
                if (e instanceof CustomException) expect(e['errorCode']).toBe(ECustomExceptionCode['AWS-RDS-EXCEPTION']);
                if (e instanceof CustomException) expect(e['statusCode']).toBe(500);
                else if(e instanceof Error) expect(e['message']).toBe(ECustomExceptionCode['UNKNOWN-SERVER-ERROR']);

            };

            expect(questionIdSpyOn).toHaveBeenCalledTimes(1);
            expect(getQuestionQuantityLimitSpyOn).toHaveBeenCalledTimes(1);
            expect(getOnlyOnceByMidSpyOn).toHaveBeenCalledTimes(1);
            expect(insertQusetionUserSpyOn).toHaveBeenCalledTimes(1);
            expect(updateUserCashSpyOn).toHaveBeenCalledTimes(1);

        });

    });


});