import { Controller, Get } from '@nestjs/common';
import { DayjsProvider } from '@providers/dayjs.provider';

@Controller()
export class AppController {
  constructor(
    private readonly dayjs: DayjsProvider
  ) {}

  @Get('')
  async getHello() {

    const previousMidnight = this.dayjs.getNextDayMidnight();
    const nextMidnight = this.dayjs.addTime(previousMidnight, 24, 'hour', 'YYYY-MM-DD HH:mm:ss');

    console.log(previousMidnight, nextMidnight);
    
  }
}
