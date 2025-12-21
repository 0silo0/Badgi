import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Создаем пул соединений PostgreSQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    // 2. Создаем адаптер Prisma для этого пула
    const adapter = new PrismaPg(pool);
    // 3. Передаем адаптер в родительский конструктор
    super({ adapter });
  }
  
  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await this.$disconnect();
      await app.close();
    });
  }
}
