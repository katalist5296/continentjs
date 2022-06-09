import { Injectable } from '@continentjs/core';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
