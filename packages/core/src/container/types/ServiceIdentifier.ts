import { Token } from '../Token';

export type ServiceIdentifier<T = any> =
  | Function
  | Token<T>
  | string
  | { service: T };
