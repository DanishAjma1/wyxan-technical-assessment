import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { SitesService } from './sites.service';
import {
  CreateSiteDto,
  CreateSiteSchema,
  SearchSitesQueryDto,
  SearchSitesQuerySchema,
} from './dto/site.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  @Get('search')
  @UsePipes(new ZodValidationPipe(SearchSitesQuerySchema))
  async search(@Query() query: SearchSitesQueryDto) {
    return this.sitesService.search(query.q || '');
  }

  @Get(':address')
  async findByAddress(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(CreateSiteSchema))
  async create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }
}
