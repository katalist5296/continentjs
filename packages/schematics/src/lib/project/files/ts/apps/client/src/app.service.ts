import { Injectable } from '@continentjs/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
