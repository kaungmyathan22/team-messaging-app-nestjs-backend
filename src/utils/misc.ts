import { PaginatedParamsDto } from '@common/dto/paginated-query.dto';

interface IPaginationMetaParams extends PaginatedParamsDto {
  totalItems: number;
}
export class MiscUtils {
  static getPaginationMeta({
    page,
    pageSize,
    totalItems,
  }: IPaginationMetaParams) {
    const totalPages = Math.ceil(totalItems / pageSize);
    return {
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page >= totalPages ? null : +page + 1,
      totalPages,
      totalItems,
      page,
      pageSize,
    };
  }
}
