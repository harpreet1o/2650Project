// config.js
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  database: process.env.DATABASE_PATH,
  secretKeyJWT: process.env.SECRET_KEY_JWT,
  port: process.env.PORT || 3000,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN,
};

export default config;
