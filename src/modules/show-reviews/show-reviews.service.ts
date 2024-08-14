import { Injectable } from '@nestjs/common';
import { CreateShowreviewDto } from './dto/create-showreview.dto';
import { UpdateShowreviewDto } from './dto/update-showreview.dto';

@Injectable()
export class ShowreviewsService {
  create(createShowreviewDto: CreateShowreviewDto) {
    return 'This action adds a new showreview';
  }

  findAll() {
    return `This action returns all showreviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} showreview`;
  }

  update(id: number, updateShowreviewDto: UpdateShowreviewDto) {
    return `This action updates a #${id} showreview`;
  }

  remove(id: number) {
    return `This action removes a #${id} showreview`;
  }
}
