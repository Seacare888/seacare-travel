import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TourService } from './tour.service';

@Controller('/api/tours')
export class TourController {
  constructor(private s: TourService) {}

  @Get()
  findAll(@Query('region') region?: string, @Query('destination') dest?: string,
    @Query('status') status?: string, @Query('featured') featured?: string) {
    return this.s.findAll({ region, destination: dest, status: status || 'active',
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
    }).then(d => ({ success: true, data: d }));
  }

  @Get('destinations/all')
  findDestinations(@Query('region') region?: string, @Query('status') status?: string) {
    return this.s.findAllDestinations({ region, status: status || 'active' })
      .then(d => ({ success: true, data: d }));
  }

  @Get(':id/detail')
  async detail(@Param('id') id: string) {
    const d = await this.s.findWithItinerary(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const d = await this.s.findOne(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Post()
  async create(@Body() b: any) {
    return this.s.create(b).then(d => ({ success: true, data: d }));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() b: any) {
    const d = await this.s.update(id, b);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const d = await this.s.delete(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }

  @Post('destinations')
  createDest(@Body() b: any) {
    return this.s.createDestination(b).then(d => ({ success: true, data: d }));
  }

  @Delete('destinations/:id')
  async deleteDest(@Param('id') id: string) {
    const d = await this.s.deleteDestination(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }
}
