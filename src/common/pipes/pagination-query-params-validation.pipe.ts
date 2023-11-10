import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PaginationQueryParamsValidationPipe implements PipeTransform<any> {
  transform(value: any, metadata: ArgumentMetadata): any {
    if (value.page && isNaN(value.page)) {
      throw new BadRequestException('Invalid page value. Must be a number.');
    }
    value.page = value.page ? parseInt(value.page, 10) : 1;

    if (value.pageSize && isNaN(value.pageSize)) {
      throw new BadRequestException(
        'Invalid pageSize value. Must be a number.',
      );
    }
    value.pageSize = value.pageSize ? parseInt(value.pageSize, 10) : 10;

    return value;
  }
}
