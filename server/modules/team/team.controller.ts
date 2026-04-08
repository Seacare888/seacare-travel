import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('api/team')
export class TeamController {
  constructor(private readonly svc: TeamService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    const data = await this.svc.findAll(status);
    return { data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.svc.create(body);
    return { data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.svc.update(id, body);
    return { data };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.svc.delete(id);
    return { data };
  }
}
