import { IClientOptions, logger } from "@tether/tether-agent"

export interface HTTPServerProps {
  port: number
}

export interface ConfigOptions {
  loglevel: logger.LogLevelDesc
  emitInterval: number
  tether: IClientOptions
  http: HTTPServerProps
}