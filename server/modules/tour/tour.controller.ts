import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { TourService } from './tour.service';
import { AuthGuard } from '../../common/guards/auth.guard';

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

  @Get('trash')
  @UseGuards(AuthGuard)
  findDeleted() {
    return this.s.findDeleted().then(d => ({ success: true, data: d }));
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
  @UseGuards(AuthGuard)
  async create(@Body() b: any) {
    return this.s.create(b).then(d => ({ success: true, data: d }));
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() b: any) {
    const d = await this.s.update(id, b);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string) {
    const d = await this.s.softDelete(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard)
  async restore(@Param('id') id: string) {
    const d = await this.s.restore(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Delete(':id/hard')
  @UseGuards(AuthGuard)
  async hardDelete(@Param('id') id: string) {
    const d = await this.s.hardDelete(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }

  @Post('destinations')
  @UseGuards(AuthGuard)
  createDest(@Body() b: any) {
    return this.s.createDestination(b).then(d => ({ success: true, data: d }));
  }

  @Put('destinations/:id')
  @UseGuards(AuthGuard)
  async updateDest(@Param('id') id: string, @Body() b: any) {
    const d = await this.s.updateDestination(id, b);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: d };
  }

  @Delete('destinations/:id')
  @UseGuards(AuthGuard)
  async deleteDest(@Param('id') id: string) {
    const d = await this.s.deleteDestination(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }
}
