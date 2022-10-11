import React from 'react'
import moment from 'moment'

import styles from 'styles/components/datetime.module.scss'

interface DateTimeProps {
  date: number
}

const DateTime: React.FC<DateTimeProps> = ({ date }) => (
  <div className={ styles.datetime }>
    <p className={ styles.heading }>
        <em>Current time:</em>
      </p>
      <p className={ styles.current }>
        <em>{moment(date).format(`dddd MMMM Do, HH:mm`)}</em>
      </p>
  </div>
)

export default DateTime