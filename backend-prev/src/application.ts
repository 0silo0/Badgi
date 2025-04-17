import express from 'express';
import routes from './routes/index';
import cors from 'cors';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const app = express();

// Настройка Winston логгера
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Настройка CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:3001',
    'http://176.123.160.42:3100',
    'http://176.123.160.42:3101',
    'https://176.123.160.42:3100',
    'https://176.123.160.42:3101',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Логирование входящих запросов
app.use((req, res, next) => {
  logger.info({
    message: 'Incoming request',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers
  });
  next();
});

app.use('/api', routes);

export default app;