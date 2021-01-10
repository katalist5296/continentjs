import { ContainerInstance } from '../ContainerInstance';

export interface Handler {
  object: Object;
  propertyName?: string;
  index?: number;
  value: (container: ContainerInstance) => any;
}
