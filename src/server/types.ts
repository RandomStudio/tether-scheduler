import { IClientOptions, logger } from "@tether/tether-agent"
import { HTTPServerProps } from "./http/types"

export interface ConfigOptions {
  loglevel: logger.LogLevelDesc
  emitInterval: number
  tether: IClientOptions
  http: HTTPServerProps
}