export class LoggerConfig {
  logging?: boolean = process.env.LOGGING === 'true' ? true : false;
  date?: boolean = true;
}

export class ConfigModel {
  logger?: LoggerConfig = new LoggerConfig();
  strict?: boolean = true;
}
