import { IClientOptions, logger } from "@randomstudio/tether"

export interface HTTPServerProps {
  port: number
}

export interface ConfigOptions {
  loglevel: logger.LogLevelDesc
  emitInterval: number
  tether: IClientOptions
  http: HTTPServerProps
}