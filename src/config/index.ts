import path from "path";
import dotenv from "dotenv";

// Parsing the env file.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Interface to load env variables
// Note these variables can possibly be undefined
// as someone could skip these varibales or not setup a .env file at all

interface ENV {
  NODE_ENV: string | undefined;
  PORT: number | undefined;
  MONGO_URI: string | undefined;
  DB_NAME: string | undefined;
  MONGO_QUERY_OPTIONS: string | undefined;
  SECRET_TOKEN: string | undefined;
  TOKEN_EXPIRY: string | undefined;
  REFRESH_TOKEN_EXPIRY: string | undefined;
  TEST_DB_NAME: string | undefined;
}

interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  DB_NAME: string;
  MONGO_QUERY_OPTIONS: string;
  SECRET_TOKEN: string;
  TOKEN_EXPIRY: string;
  REFRESH_TOKEN_EXPIRY: string;
  TEST_DB_NAME: string;
}

// Loading process.  as ENV interface

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    MONGO_URI: process.env.MONGO_URI,
    DB_NAME: process.env.DB_NAME,
    MONGO_QUERY_OPTIONS: process.env.MONGO_QUERY_OPTIONS,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    TOKEN_EXPIRY: process.env.TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    TEST_DB_NAME: process.env.TEST_DB_NAME
  };
};

// Throwing an Error if any field was undefined we don't 
// want our app to run if it can't connect to DB and ensure 
// that these fields are accessible. If all is good return
// it as Config which just removes the undefined from our type 
// definition.

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;