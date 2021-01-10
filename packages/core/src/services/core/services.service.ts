import { Service } from '../../decorators/service';
import { BehaviorSubject } from 'rxjs';
import {ServiceArgumentsInternal} from "../../decorators/interfaces/service-arguments";

@Service()
export class ServicesService {
  private services: BehaviorSubject<
    Array<ServiceArgumentsInternal>
  > = new BehaviorSubject([]);

  register(plugin) {
    this.services.next([...this.services.getValue(), plugin]);
  }

  getServices() {
    return this.services.getValue();
  }
}
