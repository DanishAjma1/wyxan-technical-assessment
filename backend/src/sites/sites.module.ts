import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Site, SiteSchema } from './schemas/site.schema';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]),
    UsersModule,
  ],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService, MongooseModule],
})
export class SitesModule {}
