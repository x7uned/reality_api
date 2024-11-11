import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UpdateSpaceDto } from './space.dto';
import { SpaceService } from './space.service';

interface GetSpaceQuery {
  id: string;
}

@Controller('space')
export class SpaceController {
  constructor(private spaceService: SpaceService) {}

  @Get('get')
  async GetSpace(@Req() req: Request, @Query() qry: GetSpaceQuery) {
    const userid = req['user'].sub;
    const queryid = qry.id;
    return this.spaceService.getSpaceById(Number(userid), Number(queryid));
  }

  @Get('getMy')
  async GetMySpaces(@Req() req: Request) {
    const userid = req['user'].sub;
    return this.spaceService.getMySpaces(Number(userid));
  }

  @Delete('delete')
  async DeleteSpace(@Req() req: Request, @Query() qry: GetSpaceQuery) {
    const userid = req['user'].sub;
    return this.spaceService.deleteSpace(Number(qry.id), Number(userid));
  }

  @Patch('update')
  async UpdateSpace(
    @Req() req: Request,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    const userid = req['user'].sub;
    return this.spaceService.updateSpace(updateSpaceDto, Number(userid));
  }

  @Post('create')
  async CreateSpace(@Req() req: Request) {
    const userid = req['user'].sub;
    return this.spaceService.createSpace(Number(userid));
  }
}
