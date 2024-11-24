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

      // Преобразуем дату из строки в объект Date
      const eventDate = new Date(date);

      if (isNaN(eventDate.getTime())) {
        return { success: false, message: 'Invalid date format' };
      }

      if (categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: categoryId, userId: userId },
        });

        if (!category) {
          return { success: false, message: "Category doesn't exist" };
        }
      }

      const result = await this.prisma.event.create({
        data: { content, subContent, date: eventDate, categoryId, userId },
      });

      if (result) {
        return { success: true, result };
      }
    } catch (error) {
      console.error(error);
    }
  }

  async deleteEvent(eventId: number, userId: number) {
    try {
      if (!eventId) {
        return { success: false, message: 'Invalid event id' };
      }

      const event = await this.prisma.event.findUnique({
        where: { id: eventId, userId },
      });

      if (!event) {
        return { success: false, message: "Event doesn't exist" };
      }

      const result = await this.prisma.event.delete({
        where: { id: event.id },
      });

      if (result) {
        return { success: true, result };
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getEvents(dateString: string, userId: number) {
    try {
      if (!dateString) {
        throw new Error('Invalid date string format');
      }

      const startDate = new Date(dateString);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }

      const tomorrow = new Date(startDate);
      tomorrow.setDate(startDate.getDate() + 1);

      const endOfWeek = new Date(startDate);
      endOfWeek.setDate(startDate.getDate() + 7);

      const events = await this.prisma.event.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lt: endOfWeek,
          },
        },
        include: { category: true },
      });

      const todayEvents = events.filter((event) =>
        this.isSameDay(event.date, startDate),
      );
      const tomorrowEvents = events.filter((event) =>
        this.isSameDay(event.date, tomorrow),
      );
      const weekEvents = events.filter(
        (event) =>
          event.date >= startDate &&
          event.date < endOfWeek &&
          !this.isSameDay(event.date, tomorrow) &&
          !this.isSameDay(event.date, startDate),
      );

      return {
        success: true,
        events: {
          today: todayEvents,
          tomorrow: tomorrowEvents,
          week: weekEvents,
        },
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        success: false,
        message: 'Failed to fetch events',
        error: error.message,
      };
    }
  }

  async getCategories(userId: number) {
    try {
      const categories = await this.prisma.category.findMany({
        where: { userId },
      });

      return { success: true, categories };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      };
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
              const fullDate = new Date(day.fullDate);
              const events = await this.prisma.event.findMany({
                where: {
                  date: fullDate,
                  userId: userId,
                },
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

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private generateCalendar(date: Date): {
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
      ).padStart(2, '0')}T00:00:00.000Z`; // Указываем полный формат ISO
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
