import { DecoratorType } from '../types/decorator';

export interface Metadata {
  moduleHash?: string;
  moduleName?: string;
  raw?: string;
  type?: DecoratorType;
  options?: any;
}
