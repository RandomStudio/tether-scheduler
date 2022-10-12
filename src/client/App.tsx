import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from './redux/store'
import { setOnState, setOperationMode } from './redux/slice'
import { OperationMode, Time, Timing } from './redux/types'
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch } from '@mui/material'
import DateTime from './components/datetime'
import Schedule from './components/schedule'

import styles from 'styles/app.module.scss'

enum SystemOnState {
  ACTIVE = "active",
  ASLEEP = "asleep",
  OFF = "off",
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
  timeOffset: number,
  build: {
    commit: string
    time: number
  }
}

const App: React.FC<AppProps> = ({ timeOffset, build }) => {
  const { operationMode, on, timings } = useSelector((state: RootState) => state.schedule)

  const [ now, setNow ] = useState(Date.now() - timeOffset)
  const [ updateInterval, setUpdateInterval ] = useState<NodeJS.Timer | void>()
  const [ doCheckBuild, setDoCheckBuild ] = useState<boolean>(true)
  const [ isUpdateAvailable, setIsUpdateAvailable ] = useState<boolean>(false)

  useLayoutEffect(() => {
    setUpdateInterval(setInterval(() => {
      setNow(Date.now() - timeOffset)
    }, 1000))

    setDoCheckBuild(true)
    checkBuild()

    return () => {
      if (updateInterval) {
        setUpdateInterval(clearInterval(updateInterval))
        setDoCheckBuild(false)
      }
    }
  }, [])

  if (operationMode === OperationMode.SCHEDULED) {
    const isOn = isWithinScheduledTimes(now, timings)
    if (isOn !== on) {
      store.dispatch(setOnState(isOn))
    }
  }

  const checkBuild = async () => {
    try {
      const response = await fetch('/api/build', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        if (data) {
          console.log(`Loaded build info from server:`, data)
          if (!Object.keys(data).includes('commit')) {
            throw new Error(`Incorrect build info received; key "commit" is missing.`)
          }
          if (!Object.keys(data).includes('time')) {
            throw new Error(`Incorrect state received; key "time" is missing.`)
          }
          if (doCheckBuild) {
            const { commit, time } = data
            if (build && (commit !== build.commit || time !== build.time)) {
              setIsUpdateAvailable(true)
            }
          }
        }
      } else {
        throw new Error(response.status.toString())
      }
    } catch(err) {
      console.error(err);
    }
    if (doCheckBuild) setTimeout(() => checkBuild(), 5000)
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
      <Dialog open={isUpdateAvailable}>
        <DialogTitle>Update</DialogTitle>
        <DialogContent>
          There is an update available. Click "Reload" to refresh the page and use the updated interface.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => document.location.reload()}>Reload</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default App
