import {IProvider} from "@continentjs/di";

export interface IModuleMetadata {
  imports?: Array<Function | IProvider>;
  exports?: Array<Function | IProvider>;
  providers?: Array<Function | IProvider>;
}
