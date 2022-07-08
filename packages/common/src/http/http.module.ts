import { Module } from "@continentjs/core";
import { HttpService } from "./http.service";

@Module({
  providers: [HttpService]
})
export class HttpModule {}
