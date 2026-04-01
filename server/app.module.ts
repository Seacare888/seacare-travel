import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { TourModule } from './modules/tour/tour.module';
import { StaffModule } from './modules/staff/staff.module';
import { ChatModule } from './modules/chat/chat.module';
import { ViewModule } from './modules/view/view.module';

export const DRIZZLE_DB = 'DRIZZLE_DB';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TourModule,
    StaffModule,
    ChatModule,
    ViewModule,
  ],
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('SUDA_DATABASE_URL');
        const client = postgres(url, { ssl: 'require' });
        return drizzle(client);
      },
    },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
  exports: [DRIZZLE_DB],
})
export class AppModule {}
