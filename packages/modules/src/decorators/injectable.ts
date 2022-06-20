import { Injectable as AInjectable } from "@continentjs/di";
import { IInjectableMetadata } from "../interfaces/injectable.interface";


export function Injectable(config: IInjectableMetadata): ClassDecorator {
  return AInjectable(config);
}
