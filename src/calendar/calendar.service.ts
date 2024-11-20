import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto, CreateEventDto } from './calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto, userId: number) {
    try {
      const { name, style } = createCategoryDto;

      const result = await this.prisma.category.create({
        data: { name, style, userId },
      });

      if (!result) {
        console.error('Something went wrong with category');
      }

      return { success: true, result };
    } catch (error) {
      console.error(error);
    }
  }

  async createEvent(createEventDto: CreateEventDto, userId: number) {
    try {
      const { content, subContent, date, categoryId } = createEventDto;

      if (categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: categoryId, userId: userId },
        });

        if (!category) {
          return { success: false, message: "Category doesn't exist" };
        }
      }

      const result = await this.prisma.event.create({
        data: { content, subContent, date, categoryId, userId },
      });

      if (result) {
        return { success: true, result };
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getCalendar(dateString: string, userId: number) {
    try {
      if (!dateString) {
        throw new Error('Invalid date string format');
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date string format');
      }

      const calendar = this.generateCalendar(date);

      const calendarWithEvents = await Promise.all(
        calendar.map(async (day) => {
          try {
            if (day.fullDate) {
              const events = await this.prisma.event.findMany({
                where: { date: day.fullDate, userId: userId },
                include: { category: true },
              });
              return { ...day, events };
            }
            return { ...day, events: [] };
          } catch (err) {
            console.error(
              `Error fetching events for date ${day.fullDate}:`,
              err,
            );
            return { ...day, events: [] };
          }
        }),
      );

      return {
        success: true,
        data: calendarWithEvents, // calendar with events[]
      };
    } catch (err) {
      console.error('Error generating calendar:', err);
      return {
        success: false,
        message: 'Failed to generate calendar',
        error: err.message,
      };
    }
  }

  generateCalendar(date: Date): {
    day: number | null;
    isCurrentMonth: boolean;
    fullDate: string | null;
  }[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      day: number | null;
      isCurrentMonth: boolean;
      fullDate: string | null;
    }[] = [];

    const formatDate = (year: number, month: number, day: number): string => {
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(
        day,
      ).padStart(2, '0')}`;
    };

    for (let i = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; i > 0; i--) {
      const day = lastDateOfPrevMonth - i + 1;
      days.push({
        day,
        isCurrentMonth: false,
        fullDate: formatDate(year, month - 1, day),
      });
    }

    for (let day = 1; day <= lastDateOfMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        fullDate: formatDate(year, month, day),
      });
    }

    const totalDays = days.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        fullDate: formatDate(year, month + 1, day),
      });
    }

    return days;
  }
}
