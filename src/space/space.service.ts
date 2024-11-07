import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateSpaceDto } from './space.dto';

@Injectable()
export class SpaceService {
  constructor(private prisma: PrismaService) {}

  async getSpaceById(userid: number, queryid: number) {
    const result = await this.prisma.space.findUnique({
      where: { id: queryid },
    });

    if (result && result.userId === userid) {
      const elements =
        typeof result.elements === 'string'
          ? JSON.parse(result.elements)
          : result.elements;
      return { result: { ...result, elements } };
    }

    return null;
  }

  async getMySpaces(userId: number) {
    const result = await this.prisma.user
      .findUnique({
        where: { id: userId },
        include: {
          spaces: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      .then((e) => e.spaces);

    return result;
  }

  async updateSpace(updateSpaceDto: UpdateSpaceDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const space = await this.prisma.space.findUnique({
      where: { id: updateSpaceDto.id },
    });

    if (!space) {
      return { success: false, message: 'Space not found' };
    }

    if (space.userId !== user.id) {
      return { success: false, message: 'Unauthorized' };
    }

    await this.prisma.space.update({
      where: { id: updateSpaceDto.id },
      data: {
        name: updateSpaceDto.name,
        background: updateSpaceDto.background,
        elements: JSON.stringify(updateSpaceDto.elements),
      },
    });

    return { success: true, message: 'Space updated successfully' };
  }

  async createSpace(userId: number) {
    if (!userId) {
      return { success: false, message: 'Invalid user ID' };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const newSpace = await this.prisma.space.create({
      data: {
        name: 'New Space',
        background: '',
        elements: [],
        user: { connect: { id: userId } },
      },
    });

    return { success: true, space: newSpace };
  }
}
