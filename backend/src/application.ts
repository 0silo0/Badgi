import express from 'express';
import routes from './routes/index';
import cors from 'cors';
// import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

  app.use(express.json());

app.use('/api', routes);

// app.use(errorHandler);

export default app;