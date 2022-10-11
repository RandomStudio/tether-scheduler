import React from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../redux/store'
import { updateTiming } from '../../redux/slice'
import { Time } from '../../redux/types'
import Checkbox from '@mui/material/Checkbox'
import TimePicker from './timepicker'

import styles from 'styles/components/schedule.module.scss'

const Days = Object.freeze([
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
]);

const Schedule: React.FC = () => {
  const { timings } = useSelector((state: RootState) => state.schedule)
  const today = (new Date()).getDay();

  const onChangeTiming = (dayOfTheWeek: number, from: Time, to: Time, enabled: boolean): void => {
    store.dispatch(updateTiming({
      dayOfTheWeek,
      startTime: from,
      endTime: to,
      enabled
    }))
  }

  return (
    <div className={styles.schedule}>
      { timings.map(({ dayOfTheWeek, startTime, endTime, enabled }, idx) => (
        <div
          key={idx}
          className={ `${styles.slot} ${dayOfTheWeek === today ? styles.active : ''}` }
        >
          <Checkbox checked={enabled} onChange={e => onChangeTiming(dayOfTheWeek, startTime, endTime, e.target.checked)} />
          <p className={styles.day}>
            { Days[dayOfTheWeek].name }
          </p>
          <TimePicker
            from={startTime}
            to={endTime}
            onChange={(from , to) => onChangeTiming(dayOfTheWeek, from, to, enabled)}
          />
        </div>
      ))}
    </div>
  )
}

export default Schedule