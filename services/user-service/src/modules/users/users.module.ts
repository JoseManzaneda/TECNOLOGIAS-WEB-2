import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersInternalController } from './users-internal.controller';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EventsModule],
  controllers: [UsersController, UsersInternalController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}