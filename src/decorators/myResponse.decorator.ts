import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import MyResponse from 'src/dto/myResponse.dto';

export type MyResponseOptions<TModel> = ApiResponseOptions & {
  model: TModel;
  isArray?: boolean;
};

export const ApiMyResponse = <TModel extends Type<any>>({
  model,
  ...rest
}: MyResponseOptions<TModel>) => {
  return applyDecorators(
    ApiExtraModels(MyResponse, model),
    ApiResponse({
      ...rest,
      schema: {
        allOf: [
          { $ref: getSchemaPath(MyResponse) },
          {
            properties: {
              data: {
                type: rest.isArray ? 'array' : 'object',
                ...(rest.isArray
                  ? { items: { $ref: getSchemaPath(model) } }
                  : { $ref: getSchemaPath(model) }),
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiMyDeletedResponse = () => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(MyResponse) },
          {
            properties: {
              data: {
                properties: {
                  affected: {
                    type: 'number',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
