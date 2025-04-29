export default class DataListDto<T = unknown> {
  items: T[];

  total: number;

  page: number;

  limit: number;

  is_datalist_dto?: boolean = true;
}
