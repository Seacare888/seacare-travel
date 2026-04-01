import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { AppModule } from '../../app.module';

@Module({
  imports: [AppModule],
  controllers: [TourController],
  providers: [TourService],
})
export class TourModule {}
