import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('api/testimonials')
export class TestimonialController {
  constructor(private readonly svc: TestimonialService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    const data = await this.svc.findAll(status);
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
