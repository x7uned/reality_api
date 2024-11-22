import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { CreateCategoryDto, CreateEventDto } from './calendar.dto';
import { CalendarService } from './calendar.service';

interface GetByDateQuery {
  date: string;
}

@Controller('calendar')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('get')
  async GetCalendar(@Req() req: Request, @Query() qry: GetByDateQuery) {
    const userid = req['user'].sub;
    const date = qry.date;
    return this.calendarService.getCalendar(date, Number(userid));
  }

  @Get('events')
  async GetEvens(@Req() req: Request, @Query() qry: GetByDateQuery) {
    const userid = req['user'].sub;
    const date = qry.date;
    return this.calendarService.getEvents(date, Number(userid));
  }

  @Post('event')
  async CreateEvent(
    @Req() req: Request,
    @Body() createEventDto: CreateEventDto,
  ) {
    const userid = req['user'].sub;
    return this.calendarService.createEvent(createEventDto, userid);
  }

  @Post('category')
  async CreateCategory(
    @Req() req: Request,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    const userid = req['user'].sub;
    return this.calendarService.createCategory(createCategoryDto, userid);
  }
}
