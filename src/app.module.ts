import { Module } from '@nestjs/common';


import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

@Module({
  imports:  [UsersModule, MongooseModule.forRoot('mongodb+srv://ftvalex:Pringles15.@cluster0.9u0x9wo.mongodb.net/oposicion')],
  controllers: [],
  providers: [],
})
export class AppModule {}
