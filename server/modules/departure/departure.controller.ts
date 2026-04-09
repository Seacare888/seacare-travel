import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DepartureService } from './departure.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/departures')
export class DepartureController {
  constructor(private readonly svc: DepartureService) {}

  @Get()
  async findAll() {
    const data = await this.svc.findAll();
    return { data };
  }

  @Get('upcoming')
  async findUpcoming() {
    const data = await this.svc.findUpcoming();
    return { data };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any) {
    const data = await this.svc.create(body);
    return { data };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.svc.update(id, body);
    return { data };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    const data = await this.svc.delete(id);
    return { data };
  }
}
