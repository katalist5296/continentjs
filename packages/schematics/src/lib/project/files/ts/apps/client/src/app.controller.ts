import { Controller } from '@continentjs/core';
import { AppService } from "./app.service";

@Controller({})
export class AppController {
  constructor(private readonly appService: AppService) {}
}
