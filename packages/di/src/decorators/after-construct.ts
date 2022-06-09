import {createMethodDecorator} from "@continentjs/metadata";


export function AfterConstruct() {
  return createMethodDecorator(AfterConstruct, {});
}
