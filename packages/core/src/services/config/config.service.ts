import { Service } from '../../decorators/service';
import { ConfigModel } from './config.model';

@Service()
export class ConfigService {
  config: ConfigModel = new ConfigModel();

  setConfig(config: ConfigModel) {
    Object.assign(this.config, config);
  }
}
