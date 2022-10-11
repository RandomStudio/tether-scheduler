import React from 'react'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { Time } from '../../redux/types'

import styles from 'styles/components/timepicker.module.scss'

export interface TimePickerProps {
  from: Time
  to: Time
  onChange: (from: Time, to: Time) => void
}

const getItems = (min: number = 0, max: number = 24) => (
  new Array(max - min).fill(0).map((v, idx) => (
    <MenuItem value={min + idx}>{ (min + idx).toString().padStart(2, '0') }</MenuItem>
  ))
)

const hrs = new Array(24).fill(0).map((v, idx) => (
  <MenuItem value={idx}>{ idx.toString().padStart(2, '0') }</MenuItem>
))

const mins = new Array(60).fill(0).map((v, idx) => (
  <MenuItem value={idx}>{ idx.toString().padStart(2, '0') }</MenuItem>
))

const TimePicker: React.FC<TimePickerProps> = ({ from, to, onChange }) => (
  <div className={ styles.timepicker }>
    <p>From</p>
    <Select
      size="small"
      value={from.hours}
      onChange={e => onChange({ ...from, hours: Number(e.target.value) }, to)}
    >
      { getItems(0, Math.min(24, to.hours + 1)).map(el => el) }
    </Select>
    <Select
      size="small"
      value={from.minutes}
      onChange={e => onChange({ ...from, minutes: Number(e.target.value) }, to)}
    >
      { getItems(0, from.hours < to.hours ? 60 : Math.min(60, to.minutes + 1)).map(el => el) }
    </Select>
    <p>To</p>
    <Select
      size="small"
      value={to.hours}
      onChange={e => onChange(from, { ...to, hours: Number(e.target.value) })}
    >
      { getItems(from.hours, 24).map(el => el) }
    </Select>
    <Select
      size="small"
      value={to.minutes}
      onChange={e => onChange(from, { ...to, minutes: Number(e.target.value) })}
    >
      { getItems(from.hours === to.hours ? from.minutes : 0, 60).map(el => el) }
    </Select>
  </div>
)

export default TimePicker