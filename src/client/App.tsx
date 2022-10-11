import React, { useState } from 'react'
import { OperationMode } from './types'
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"

import styles from 'styles/app.module.scss'

const App: React.FC = () => {
  const [ busy, setBusy ] = useState(false)
  const [ operationMode, setOperationMode ] = useState<OperationMode>(OperationMode.SCHEDULED)
  const [ on, setOn ] = useState(false)
  
  return (
    <div className={ styles.app }>
      <div className={ styles.header }>
        <FormControlLabel
          control={ <Switch /> }
          label={ `System is ${operationMode}` }
        />
      </div>
    </div>
  )
}

export default App