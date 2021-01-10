import { Service } from '../../decorators/service';
import { BehaviorSubject } from 'rxjs';
import {ServiceArgumentsInternal} from "../../decorators/interfaces/service-arguments";

@Service()
export class BehaviorsService {
  private behaviors: BehaviorSubject<
    Array<ServiceArgumentsInternal>
  > = new BehaviorSubject([]);

  register(plugin) {
    this.behaviors.next([...this.behaviors.getValue(), plugin]);
  }

  getComponents() {
    return this.behaviors.getValue();
  }
}
