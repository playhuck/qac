import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CustomConfigModule } from '@modules/config.module';
import { CustomTypeOrmModule } from '@modules/typeorm.module';
import { ProvidersModule } from '@modules/provider.module';
import { UserModule } from '@modules/user.module';
import { QuestionModule } from '@modules/question.module';

@Module({
  imports: [
    CustomConfigModule,
    CustomTypeOrmModule,
    ProvidersModule,

    UserModule,
    QuestionModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
