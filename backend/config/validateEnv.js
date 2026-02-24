import { cleanEnv, str, port } from 'envalid';

const validateEnv = () => {
  return cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'], default: 'production' }),
    PORT: port({ default: 10000 }),
    MONGO_URI: str(),
    JWT_SECRET: str(),
  });
};

export default validateEnv;
