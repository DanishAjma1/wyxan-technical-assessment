import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { HistoryService } from './history.service';
import {
  CreateVisitDto,
  CreateVisitSchema,
  GetHistoryQueryDto,
  GetHistoryQuerySchema,
} from './dto/visit.dto';
import { ZodValidationPipe } from '../common/zod-validation.pipe';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateVisitSchema))
  async recordVisit(@Body() dto: CreateVisitDto) {
    return this.historyService.recordVisit(dto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(GetHistoryQuerySchema))
  async getUserHistory(@Query() query: GetHistoryQueryDto) {
    return this.historyService.getUserHistory(query.user);
  }
}
