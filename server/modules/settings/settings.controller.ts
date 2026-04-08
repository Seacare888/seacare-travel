import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/settings')
export class SettingsController {
  constructor(private readonly svc: SettingsService) {}

  @Get()
  async getAll() {
    const data = await this.svc.findAll();
    return { data };
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateAll(@Body() body: Record<string, string>) {
    const data = await this.svc.updateAll(body);
    return { data };
  }
}
