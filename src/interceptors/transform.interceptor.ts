import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';
import DataListDto from 'src/dto/datalist.dto';
import MyResponse from 'src/dto/myResponse.dto';

type Response<T> = MyResponse<T> | DataListDto<T>;

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    return next.handle().pipe(
      map((res) => {
        if ((res as any)?.is_datalist_dto) {
          const dto = plainToInstance(DataListDto<T>, res);
          delete dto.is_datalist_dto;
          return dto;
        }
        return {
          data: res,
        };
      }),
    );
  }
}
