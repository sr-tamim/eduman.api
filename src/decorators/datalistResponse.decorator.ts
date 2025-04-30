import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import DataListDto from 'src/dto/datalist.dto';

export const ApiDataListResponse = <TModel extends Type<any>>({
  description,
  type,
}: {
  description: string;
  type: TModel;
}) => {
  return applyDecorators(
    ApiExtraModels(DataListDto, type),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(DataListDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          },
        ],
      },
    }),
  );
};
