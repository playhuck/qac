import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (config: ConfigService) => ({
                type: 'sqlite',
                database: 'fy',
                autoLoadEntities: true,
                synchronize: true,
                connectTimeout: 30000,
                extra: {
                    connectionLimit: 30,
                },
                dropSchema: true
            }),
            inject: [ConfigService]
        })
    ]
})
export class CustomTypeOrmModule { }