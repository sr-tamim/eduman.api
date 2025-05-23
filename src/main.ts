import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let server: Handler;
const runningOnLambda = process.env.NOT_LAMBDA !== 'true';
const isDev = process.env.NODE_ENV === 'development';

const bootstrap: () => Promise<Handler | void> = async () => {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || [],
      credentials: true,
    },
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.use(cookieParser());
  app.useGlobalInterceptors(new LoggingInterceptor());
  // app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduMan API')
    .addServer(runningOnLambda ? (!isDev ? '/prod' : '/dev') : '/')
    .build();
  const documentFactory = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, documentFactory);

  if (!runningOnLambda) {
    await app.listen(process.env.APP_PORT || 3000);
    return;
  } else {
    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverlessExpress({ app: expressApp });
  }
};

type EventPayload = {
  [key: string]: any;
};

export const handler: Handler = async (
  event: EventPayload,
  context: Context,
  callback: Callback,
) => {
  if (!runningOnLambda) return;
  if (event.path === '' || event.path === undefined) event.path = '/';
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

if (!runningOnLambda) bootstrap();
