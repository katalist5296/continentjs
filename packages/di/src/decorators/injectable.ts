import {createClassDecorator} from "@continentjs/metadata";

export function Injectable() {
  return createClassDecorator(Injectable);
}

