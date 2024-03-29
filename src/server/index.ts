import { encode } from '@msgpack/msgpack';
import { logger, TetherAgent } from '@randomstudio/tether';
import exitHook from 'async-exit-hook';
import parse from 'parse-strings-in-object';
import rc from 'rc';

import { ConfigOptions } from './config/types';
import HTTPServer from './http';
import { setOnState } from './redux/slice';
import { hydrateStore, persistStore, store } from './redux/store';
import { OperationMode, Time } from './redux/types';

const config: ConfigOptions = parse(rc(
  "scheduler",
  {
    loglevel: "info",
    emitInterval: 5000,
    tether: {
      host: "localhost",
      port: 1883
    },
    http: {
      port: 5555
    }
  }
))

let interval: NodeJS.Timer
let agent: TetherAgent
let httpServer: HTTPServer

const compareTimes = (a: Time, b: Time): number => {
  const dateA = new Date();
  dateA.setHours(a.hours, a.minutes);
  const dateB = new Date();
  dateB.setHours(b.hours, b.minutes);
  return dateA.getTime() - dateB.getTime();
}

const checkSchedule = () => {
  const { schedule: { operationMode, timings } } = store.getState()
  if (operationMode === OperationMode.SCHEDULED) {
    const now = new Date()
    const day = now.getDay()
    const timing = timings.find(t => t.dayOfTheWeek == day)
    if (!timing) {
      logger.warn(`No entry present in schedule for day ${day}`)
      store.dispatch(setOnState(false))
      agent.getOutput("on")?.publish(Buffer.from(encode(false)), { qos: 2, retain: true })
    } else {
      const time = { hours: now.getHours(), minutes: now.getMinutes() }
      const { enabled, startTime, endTime } = timing
      if (enabled) {
        logger.debug(`Determining on state by schedule: ${startTime.hours}:${startTime.minutes.toString().padStart(2, '0')} - ${endTime.hours}:${endTime.minutes.toString().padStart(2, '0')}. Current time: ${time.hours}:${time.minutes.toString().padStart(2, '0')}`)
      }
      const isWithinSchedule =
        enabled
        && compareTimes(time, startTime) >= 0
        && compareTimes(time, endTime) < 0
      logger.debug(`Sending scheduled state, on:`, isWithinSchedule)
      store.dispatch(setOnState(isWithinSchedule))
      agent.getOutput("on")?.publish(Buffer.from(encode(isWithinSchedule)), { qos: 2, retain: true })
    }
  } else {
    const { schedule: { on } } = store.getState()
    logger.debug(`Current on state is ${on}`)
    agent.getOutput("on")?.publish(Buffer.from(encode(on)), { qos: 2, retain: true })
  }
}

const start = async () => {
  try {
    agent = await TetherAgent.create("scheduler", config.tether, config.loglevel)
    agent.createOutput("on")
  } catch (err) {
    logger.error(`Cannot create Tether agent.`, err)
    process.exit(-1)
  }
  
  try {
    hydrateStore('data.json')
  } catch(err) {
    console.warn(err)
  }

  checkSchedule()
  interval = setInterval(checkSchedule, config.emitInterval)
  
  httpServer = new HTTPServer(config.http)
  // respond to manual changes immediately rather than waiting for the next interval
  httpServer.on("updated-schedule", () => {
    persistStore('data.json')
    checkSchedule()
  })
  httpServer.start()
}

start()

exitHook(async callback => {
  logger.info(`Quitting`)
  clearInterval(interval)
  if (httpServer) await httpServer.stop()
  if (agent) await agent.disconnect()
  callback()
})