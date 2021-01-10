import { Service } from '../../decorators/service';
import { ConfigService } from '../config';
import { Injector } from '../../decorators/injector';

@Service()
export class LoggerService {
  @Injector(ConfigService) configService: ConfigService;

  log(message: string) {
    if (this.configService.config.logger.logging) {
      console.log(message);
    }
  }

  error(message: string) {
    console.error(message);
  }

  logImporter(message: string) {
    if (this.configService.config.logger.logging) {
      return this.log(message);
    }
  }
}
