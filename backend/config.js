// config.js
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  databaseUser: process.env.DATABASE_USER,
  databasePassword: process.env.DATABASE_PASSWORD,
  databaseName: process.env.DATABASE_NAME,
  databaseHost: process.env.DATABASE_HOST,
  secretKeyJWT: process.env.SECRET_KEY_JWT,
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN
};


export default config;
