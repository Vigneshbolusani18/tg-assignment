import 'dotenv/config';

export const env = {
  PORT: Number(process.env.PORT ?? 8080),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev_secret_change_me',
  ACCESS_TOKEN_MIN: Number(process.env.ACCESS_TOKEN_MIN ?? 15),
  REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS ?? 7),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
};
