import SyncIcon from '@mui/icons-material/Sync';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styles from 'styles/app.module.scss';

import DateTime from './components/datetime';
import Schedule from './components/schedule';
import { setOnState, setOperationMode } from './redux/slice';
import { RootState, store } from './redux/store';
import { OperationMode, Time, Timing } from './redux/types';

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
  const { operationMode, on, timings, busy, persistError } = useSelector((state: RootState) => state.schedule)

  const [ now, setNow ] = useState(Date.now() - timeOffset)
  const [ updateInterval, setUpdateInterval ] = useState<NodeJS.Timer | void>()
  const [ doCheckBuild, setDoCheckBuild ] = useState<boolean>(true)
  const [ isUpdateAvailable, setIsUpdateAvailable ] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (updateInterval) {
      clearInterval(updateInterval)
    }
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
    console.log("Retrieving build info")
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

  const onRequestShutdown = async () => {
    const response = await fetch('/api/shutdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) {
      console.error(`Could not request shutdown.`)
    }
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
        <svg style={{ marginLeft: '1em' }} height="30px" width="30px" version="1.1" viewBox="0 0 496.158 496.158"
          onClick={e => onRequestShutdown()}>
          {/* <path style={{ fill: '#e5c0c0', filter: 'darken(0.5)' }} d="M496.158,248.085c0-137.021-111.07-248.082-248.076-248.082C111.07,0.003,0,111.063,0,248.085
            c0,137.002,111.07,248.07,248.082,248.07C385.088,496.155,496.158,385.087,496.158,248.085z"/> */}
          <g>
            <path style={{ fill: '#D63232' }} d="M373.299,154.891c-19.558-26.212-47.401-46.023-78.401-55.787c-0.759-0.238-1.588-0.103-2.229,0.369
              c-0.643,0.471-1.021,1.22-1.021,2.016l0.16,40.256c0,1.074,0.514,2.06,1.332,2.562c31.732,19.456,66.504,47,66.504,103.237
              c0,61.515-50.047,111.56-111.562,111.56c-61.517,0-111.566-50.045-111.566-111.56c0-58.737,35.199-84.661,67.615-103.917
              c0.836-0.496,1.363-1.492,1.363-2.58l0.154-39.909c0-0.793-0.375-1.539-1.013-2.01c-0.638-0.472-1.46-0.611-2.219-0.381
              c-31.283,9.586-59.41,29.357-79.202,55.672c-20.467,27.215-31.285,59.603-31.285,93.662c0,86.099,70.049,156.146,156.152,156.146
              c86.1,0,156.147-70.047,156.147-156.146C404.228,214.235,393.533,182.01,373.299,154.891z"/>
            <path style={{ fill: '#D63232' }} d="M251.851,67.009h-7.549c-11.788,0-21.378,9.59-21.378,21.377v181.189
              c0,11.787,9.59,21.377,21.378,21.377h7.549c11.788,0,21.378-9.59,21.378-21.377V88.386
              C273.229,76.599,263.64,67.009,251.851,67.009z"/>
          </g>
        </svg>
      </div>
      <Schedule />
      { persistError !== null && (
        <div className={ styles.error }>
          {`An error occurred when saving. ${persistError}`}
        </div>
      )}
      <Dialog open={persistError !== null}>
        <DialogTitle>An error occurred</DialogTitle>
        <DialogContent>
          <p>An error occurred when saving data:</p>
          <p style={{
            backgroundColor: `rgba(255,0,0,0.25)`,
            color: `#600`, padding: `0.5em`, boxSizing: `border-box`,
          }}>{persistError}</p>
          <p>
            Please try making your change again after reloading the page.<br/>
            If the error persists or the page will not successfully reload, please contact support.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => document.location.reload()}>Reload</Button>
        </DialogActions>
      </Dialog>
      { busy && (
        <div className={styles.busy}>
          <SyncIcon />
        </div>
      )}
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
