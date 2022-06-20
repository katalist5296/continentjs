import { IProvider } from "@continentjs/di";

export type InjectorScope = 'root';

export interface IInjectableMetadata {
  providedIn: InjectorScope | Function | IProvider;
}
