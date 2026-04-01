import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export const DRIZZLE_DB = 'DRIZZLE_DB';

@Global()
@Module({
  imports: [ConfigModule],
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
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
