import React, { useLayoutEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from './redux/store'
import { setOnState, setOperationMode } from './redux/slice'
import { OperationMode, Time, Timing } from './redux/types'
import Checkbox from '@mui/material/Checkbox'
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import DateTime from './components/datetime'
import Schedule from './components/schedule'

import styles from 'styles/app.module.scss'

enum SystemOnState {
  ACTIVE = "active",
  ASLEEP = "asleep",
  OFF = "off",
}

const isBeforeTime = (a: Date, limit: Time): boolean => {
  if (a.getHours() > limit.hours) return false
  if (a.getHours() === limit.hours) {
    return a.getMinutes() < limit.minutes
  }
  return true
}

const isAfterTime = (a: Date, limit: Time): boolean => {
  if (a.getHours() < limit.hours) return false
  if (a.getHours() === limit.hours) {
    return a.getMinutes() >= limit.minutes
  }
  return true
}

const compareTimes = (a: Time, b: Time): number => {
  const dateA = new Date();
  dateA.setHours(a.hours, a.minutes);
  const dateB = new Date();
  dateB.setHours(b.hours, b.minutes);
  return dateA.getTime() - dateB.getTime();
}

const isWithinScheduledTimes = (now: number, timings: Timing[]): boolean => {
  const date = new Date(now)
  const times = timings.find(t => t.dayOfTheWeek === date.getDay())
  if (times) {
    if (!times.enabled) return false
    const time = { hours: date.getHours(), minutes: date.getMinutes() }
    return compareTimes(time, times.startTime) >= 0 && compareTimes(time, times.endTime) < 0
  }
  return false
}

interface AppProps {
  timeOffset: number
}

const App: React.FC<AppProps> = ({ timeOffset }) => {
  const { operationMode, on, timings } = useSelector((state: RootState) => state.schedule)

  const [ now, setNow ] = useState(Date.now() - timeOffset)
  const [ interval, updateInterval ] = useState<NodeJS.Timer | void>()

  useLayoutEffect(() => {
    updateInterval(setInterval(() => setNow(Date.now() - timeOffset), 1000))
    return () => {
      if (interval) {
        updateInterval(clearInterval(interval))
      }
    }
  }, [])

  if (operationMode === OperationMode.SCHEDULED) {
    const isOn = isWithinScheduledTimes(now, timings)
    if (isOn !== on) {
      store.dispatch(setOnState(isOn))
    }
  }
  
  // When running on a schedule, the system is either active or asleep. When manual, it's on or off.
  const systemOnState = on
    ? SystemOnState.ACTIVE
    : operationMode === OperationMode.SCHEDULED
      ? SystemOnState.ASLEEP
      : SystemOnState.OFF
  
  const onChangeOperationMode = (scheduled: boolean): void => {
    store.dispatch(
      setOperationMode(
        scheduled ? OperationMode.SCHEDULED : OperationMode.MANUAL
      )
    )
  }

  const onChangeOnState = (on: boolean): void => {
    store.dispatch(setOnState(on))
  }

  return (
    <div className={ styles.app }>
      <div className={ `${styles.header} ${styles[systemOnState]}` }>
        <FormControlLabel
          control={
            <Checkbox
              checked={operationMode === OperationMode.SCHEDULED}
              onChange={e => onChangeOperationMode(e.target.checked)}
            />
          }
          label={ `Use schedule` }
        />
        <FormControlLabel
          control={
            <Switch
              checked={on}
              disabled={operationMode === OperationMode.SCHEDULED}
              onChange={e => onChangeOnState(e.target.checked)}
            />
          }
          label={ `System is ${systemOnState}` }
        />
        <div className={styles.spacer} />
        <DateTime date={now} />
      </div>
      <Schedule />
    </div>
  )
}

export default App
