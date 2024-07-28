import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';

@Controller('health')
export class HealthController {
  @IsPublic()
  @Get()
  async health(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'server is running',
    });
  }
}
