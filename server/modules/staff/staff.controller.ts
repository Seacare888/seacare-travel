import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { AuthGuard } from '../../common/guards/auth.guard';

@Controller('/api/staff')
export class StaffController {
  constructor(private s: StaffService) {}

  @Get() findAll() { return this.s.findAll().then(d => ({ success: true, data: d })); }

  @Post('login')
  async login(@Body() b: { username: string; password: string }) {
    const user = await this.s.validateLogin(b.username, b.password);
    if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    return { success: true, data: user };
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() b: { username: string; password: string; name: string; role?: string }) {
    const ex = await this.s.findByUsername(b.username);
    if (ex) throw new HttpException('Username exists', HttpStatus.CONFLICT);
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
    const d = await this.s.delete(id);
    if (!d) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true };
  }
}
