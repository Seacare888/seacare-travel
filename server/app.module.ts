import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { DatabaseModule } from './database/database.module';
import { TourModule } from './modules/tour/tour.module';
import { StaffModule } from './modules/staff/staff.module';
import { ChatModule } from './modules/chat/chat.module';
import { LineModule } from './modules/line/line.module';
import { ViewModule } from './modules/view/view.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TeamModule } from './modules/team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TourModule,
    StaffModule,
    ChatModule,
    LineModule,
    ViewModule,
    SettingsModule,
    TeamModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
