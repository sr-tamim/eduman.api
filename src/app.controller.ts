import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async checkHealth() {
    try {
      // Check if database connection is alive
      const isConnected = this.dataSource.isInitialized;

      if (isConnected) {
        // Further verify by running a simple query
        await this.dataSource.query('SELECT 1');
        return { status: 'ok', database: 'connected' };
      } else {
        return { status: 'error', database: 'disconnected' };
      }
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
