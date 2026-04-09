import { Module } from '@nestjs/common';
import { DepartureController } from './departure.controller';
import { DepartureService } from './departure.service';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [StaffModule],
  controllers: [DepartureController],
  providers: [DepartureService],
})
export class DepartureModule {}
