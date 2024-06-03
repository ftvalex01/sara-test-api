import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { TestsModule } from './tests/tests.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60, // Tiempo de vida en segundos
      limit: 10, // Número de solicitudes permitidas en ese tiempo
    }]),
    UsersModule,
    QuestionsModule,
    TestsModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
