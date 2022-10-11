import path from "path"
import EventEmitter from "events"
import express, { Express, Request, Response } from "express"
import { Server } from "http"
import { createHttpTerminator, HttpTerminator } from "http-terminator";
import { store } from "../redux/store";
import { setOnState, setOperationMode, updateFullState, updateTiming } from "../redux/slice";
import { OperationMode } from "../redux/types";
import { readFile } from "fs/promises";
import { logger } from "@tether/tether-agent"
import { BuildInfo, HTTPServerProps } from "./types"

const days = Object.freeze([
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
]);

export default class HTTPServer extends EventEmitter {
  private expressApp: Express
  private server: Server | null
  private httpTerminator: HttpTerminator
  private port: number
  private isRunning: boolean = false

  constructor(props: HTTPServerProps) {
    super()

    this.port = props.port

    this.expressApp = express()
    this.expressApp.use(express.json())
    this.expressApp.use(express.urlencoded({ extended: true }))
    this.expressApp.use(express.static(path.join(__dirname, "../..", "client")))
    logger.info(`Serving static files from ${path.join(__dirname, "../..", "client")}`)

    this.expressApp.get("/api/state", this.apiGetState)
    this.expressApp.post("/api/state", this.apiSetState)
  }

  start = () => {
    if (this.isRunning) return
    this.server = this.expressApp.listen(this.port)

    // wrap server instance in a "terminator", which will keep track of all
    // open connections and notify connected clients when the server is
    // about to shut down
    this.httpTerminator = createHttpTerminator({ 
      gracefulTerminationTimeout: 5000,
      server: this.server
    })

    logger.info(`Frontend server running on port ${this.port}`);
    this.isRunning = true
  }

  stop = async () => {
    if (!this.isRunning) return
    await this.httpTerminator.terminate()
    this.server = null
    this.isRunning = false
  }

  private apiGetState = async (req: Request, res: Response) => {
    try {
      const buildInfo = await this.loadBuildInfo()
      res.json({
        ...store.getState(),
        build: buildInfo, // provide frontend with latest build info
        serverTime: Date.now(), // send the current server time to sync the client
      });
    } catch (err) {
      res.status(500).send(err.toString())
    }
  }

  private apiSetState = async (req: Request, res: Response) => {
    logger.info(`Received state:`, req.body)
    store.dispatch(updateFullState(req.body))
    this.emit("updated-schedule")
  }

  private loadBuildInfo = (): Promise<BuildInfo> => (
    new Promise(async (resolve, reject) => {
      const filePath: string = path.resolve(__dirname, "../..", "build.json")
      logger.info(`Loading build info from path "${filePath}"`)
      try {
        const data = await readFile(filePath)
        try {
          const json = JSON.parse(data.toString())
          logger.debug(`Loaded build info:`, json)
          resolve(json as BuildInfo);
        } catch (parseError) {
          logger.error("Parse JSON from file error:", parseError)
          reject(parseError)
        }
      } catch (err) {
        logger.error("Read file error:", err)
        reject(err)
      }
    })
  )
}