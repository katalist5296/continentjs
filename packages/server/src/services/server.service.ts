import { Service } from '@rage-framework/core';
import { ApplicationService } from '@rage-framework/core';
import { ExitHandlerService } from './utils/exit-handler.service';
import { ConfigModel } from '@rage-framework/core';

@Service()
export class ServerService {
  constructor(
    private applicationService: ApplicationService,
    private exitHandlerService: ExitHandlerService,
  ) {}

  public start(app, config?: ConfigModel) {
    this.exitHandlerService.init();

    this.applicationService.start(app, config).subscribe(
      () => console.log('Server Started!'),
      (err) => console.error(err),
    );
  }
}
