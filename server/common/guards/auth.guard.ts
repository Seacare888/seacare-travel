import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { StaffService } from '../../modules/staff/staff.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private staffService: StaffService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    if (!userId) throw new UnauthorizedException('กรุณาเข้าสู่ระบบก่อน');
    const user = await this.staffService.findById(userId);
    if (!user || user.status !== 'active') throw new UnauthorizedException();
    request.user = user;
    return true;
  }
}
