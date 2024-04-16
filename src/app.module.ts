// src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    UsersModule,
    QuestionsModule,
    TestsModule,
    MongooseModule.forRoot('mongodb+srv://ftvalex:Pringles15.@cluster0.9u0x9wo.mongodb.net/oposicion'),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
