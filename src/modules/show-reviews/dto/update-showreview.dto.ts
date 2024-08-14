import { PartialType } from '@nestjs/mapped-types';
import { CreateShowreviewDto } from './create-showreview.dto';

export class UpdateShowreviewDto extends PartialType(CreateShowreviewDto) {}
