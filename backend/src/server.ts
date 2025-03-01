import dotenv from 'dotenv';
dotenv.config();

import app from './application';
import prisma from './prisma';
import { connectToRedis } from './config/redis';

const PORT = process.env.PORT || 4132;

async function main() {
  try {
    await Promise.all([
      prisma.$connect(),  // Подключение к базе данных
      connectToRedis(),   // Подключение к Redis
    ]);

    console.log('Connected to the database and Redis');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database or Redis:', error);
    process.exit(1);
  }
}

main().catch(console.error);

// prisma.$connect()
//   .then(() => {
//     console.log('Connected to the database');

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Failed to connect to the database:', error);
//     process.exit(1);
//   });

// connectToDatabase()
//   .then(() => {
//     console.log('Connected to the database');

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Failed to connect to the database:', error);
//     process.exit(1);
//   });