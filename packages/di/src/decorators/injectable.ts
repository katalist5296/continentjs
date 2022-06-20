import {createClassDecorator} from "@continentjs/metadata";

export function Injectable(args?: object) {
  return createClassDecorator(Injectable, args);
}

