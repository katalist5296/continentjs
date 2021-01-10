import { Metadata } from './metadata';
import {
  ServiceArguments,
  ServiceArgumentsInternal,
} from './service-arguments';

export interface IModuleOptions<T, K> extends Metadata {
  modules?: Array<Function | ModuleWithServices>;
  services?: Array<Function | ServiceArgumentsInternal>;
  behaviors?: Array<Function>;
}

export interface ModuleWithServices {
  module?: Function;
  services?: Array<ServiceArguments | Function>;
  behaviors?: Array<Function>;
}
