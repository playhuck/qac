import { DataSource } from "typeorm";

export type MockType<T> = {
    [P in keyof T]?: jest.Mock<{}>
}

export type PartialFuncReturn<T> = {
    [K in keyof T]?: T[K] extends (...args: infer A) => infer U
      ? (...args: A) => PartialFuncReturn<U>
      : DeepPartial<T[K]>;
  };

  type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : unknown extends T[P]
      ? T[P]
      : DeepPartial<T[P]>;
  };

  export const createMock = <T extends object>(
    partial: PartialFuncReturn<T> = {},
    options: MockOptions = {}
  ): DeepMocked<T> => {
    const cache = new Map<string | number | symbol, any>();
    const { name = 'mock' } = options;

    const proxy = new Proxy(partial, {
      get: (obj, prop) => {
        if (
          prop === 'inspect' ||
          prop === 'then' ||
          (typeof prop === 'symbol' &&
            prop.toString() === 'Symbol(util.inspect.custom)')
        ) {
          return undefined;
        }
        
        if (cache.has(prop)) {
          return cache.get(prop);
        }
  
        const checkProp = obj[prop];
  
        let mockedProp: any;
  
        if (prop in obj) {
          mockedProp =
            typeof checkProp === 'function' ? jest.fn(checkProp) : checkProp;
        } else if (prop === 'constructor') {
          mockedProp = () => undefined;
        } else {
          mockedProp = createRecursiveMockProxy(`${name}.${prop.toString()}`);
        }
        
        cache.set(prop, mockedProp);
        
        return mockedProp;
      },
    });

    return proxy as DeepMocked<T>;
  };

  const createRecursiveMockProxy = (name: string) => {
    const cache = new Map<string | number | symbol, any>();
  
    const proxy = new Proxy(
      {},
      {
        get: (obj, prop) => {
          const propName = prop.toString();
          if (cache.has(prop)) {
            return cache.get(prop);
          };
  
          const checkProp = obj[prop];
  
          const mockedProp =
            prop in obj
              ? typeof checkProp === 'function'
                ? jest.fn()
                : checkProp
              : propName === 'then'
              ? undefined
              : createRecursiveMockProxy(propName);
  
          cache.set(prop, mockedProp);
  
          return mockedProp;
        },
      }
    );
  
    return jest.fn(() => proxy);
  };
  
  export type MockOptions = {
    name?: string;
  };

  export type DeepMocked<T> = {
    [K in keyof T]: Required<T>[K] extends (...args: any[]) => infer U
      ? jest.MockInstance<ReturnType<Required<T>[K]>, jest.ArgsType<T[K]>> &
          ((...args: jest.ArgsType<T[K]>) => DeepMocked<U>)
      : T[K];
  } & T;

export class CommonFakeFactory {

    get mockedCommonFactory() {

        const mockedS3OthersProvider = {
            getS3Client: jest.fn(),
            getPresignedUrl: jest.fn(),
            deleteObject: jest.fn(),
            imageKey: jest.fn()
        };

        const mockedCfOthersProvider = {
            getSignedUrl: jest.fn()
        };

        const mockedDayjsProvider = {
            getDatetimeByOptions: jest.fn(),
            addTime: jest.fn(),
            getDifftime: jest.fn(),
            getNextDayMidnight: jest.fn(),
            getDateForMailTemplate: jest.fn(),
            getDatetimeWithOffset: jest.fn()
        }

        const mockedDataSource: MockType<DataSource> = {
            createQueryRunner: jest.fn().mockImplementation(() => ({
                connect: jest.fn(),
                startTransaction: jest.fn(),
                commitTransaction:jest.fn(),
                release: jest.fn(),
                rollbackTransaction: jest.fn(),
                manager: jest.fn().mockImplementation(() => ({

                    save: jest.fn(),
                    create: jest.fn()

                }))
            }))
        }

        return { mockedCfOthersProvider, mockedS3OthersProvider, mockedDayjsProvider, mockedDataSource }
    }

};