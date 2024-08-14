import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShowreviewsService } from './show-reviews.service';
import { CreateShowreviewDto } from './dto/create-showreview.dto';
import { UpdateShowreviewDto } from './dto/update-showreview.dto';

@Controller('/shows/:showId/reviews')
export class ShowreviewsController {
  constructor(private readonly showreviewsService: ShowreviewsService) {}

  @Post()
  create(@Body() createShowreviewDto: CreateShowreviewDto) {
    return this.showreviewsService.create(createShowreviewDto);
  }

  @Get()
  findAll() {
    return this.showreviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showreviewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowreviewDto: UpdateShowreviewDto) {
    return this.showreviewsService.update(+id, updateShowreviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.showreviewsService.remove(+id);
  }
}
