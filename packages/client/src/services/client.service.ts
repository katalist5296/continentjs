import { Service } from '@rage-framework/core';
import { ApplicationService } from '@rage-framework/core';
import { ConfigModel } from '@rage-framework/core';

@Service()
export class ClientService {
  constructor(
    private applicationService: ApplicationService
  ) {}

  public start(app, config?: ConfigModel) {
    this.applicationService.start(app, config).subscribe(
      () => console.log('Client Started!'),
      (err) => console.error(err),
    );
  }
}
