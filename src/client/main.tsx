import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import { updateFullState } from './redux/slice'
import { SchedulerState } from './redux/types'
import App from './App'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'styles/index.css'

interface ServerSettings {
  time: number
  build: {
    commit: string
    time: number
  }
}

// Perform initial state load from the server to hydrate store
const hydrate = async (): Promise<ServerSettings> => new Promise(async (resolve, reject) => {
  try {
    const response = await fetch('/api/state', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.ok) {
      const data = await response.json()
      if (data) {
        console.log(`Loaded state from server:`, data)
        if (!Object.keys(data).includes('schedule')) {
          throw new Error(`Incorrect state received; key "schedule" is missing.`)
        }
        if (!Object.keys(data.schedule).includes('timings')) {
          throw new Error(`Incorrect state received; key "schedule.timings" is missing.`)
        }
        store.dispatch(updateFullState(data.schedule as SchedulerState))
        resolve({ time: Number(data.serverTime), build: data.build })
      }
    } else {
      throw new Error(response.status.toString())
    }
  } catch(err) {
    console.error(err);
    reject(err)
  }
})

hydrate().then(({ time, build }) => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <App timeOffset={ Date.now() - time } build={build} />
      </Provider>
    </React.StrictMode>
  )
})

