import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  CUSTOMER_JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  CUSTOMER_JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  RAZORPAY_KEY_ID: Joi.string().required(),
  RAZORPAY_KEY_SECRET: Joi.string().required(),
  RAZORPAY_WEBHOOK_SECRET: Joi.string().required(),
  RAZORPAY_RECURRING_WEBHOOK_SECRET: Joi.string().required(),
  S3_ENDPOINT: Joi.string().allow('').optional(), // empty = real AWS, per your existing S3Service logic
  S3_BUCKET: Joi.string().required(),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_PUBLIC_URL: Joi.string().uri().required(),
  CORS_ORIGINS: Joi.string().required(),
  APP_NAME: Joi.string().default('Admin Console'),
  SENTRY_DSN: Joi.string().allow('').optional(),
});
