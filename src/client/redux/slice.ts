import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { store } from "./store"
import { OperationMode, SchedulerState, Timing } from "./types"

const initialState: SchedulerState = {
  busy: false,
  persistError: null,
  operationMode: OperationMode.SCHEDULED,
  on: false,
  timings: [
    {
      dayOfTheWeek: 0,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 1,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 2,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 3,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 4,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 5,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
    {
      dayOfTheWeek: 6,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: false
    },
  ]
}

const persist = async (state: SchedulerState, data: any) => {
  store.dispatch(startFetch)
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      // throw new Error(response.status.toString());
      store.dispatch(finishFetch(`Could not fetch, response status: ${response.status.toString()}`))
    } else {
      store.dispatch(finishFetch(null))
    }
  } catch(err) {
    store.dispatch(finishFetch(`Could not fetch, error: ${err}`))
  }
}

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    updateFullState(state, action: PayloadAction<SchedulerState>) {
      return {
        ...state,
        ...action.payload
      }
    },
    setOperationMode(state, action: PayloadAction<OperationMode>) {
      state.operationMode = action.payload
      persist(state, { operationMode: action.payload })
    },
    setOnState(state, action: PayloadAction<boolean>) {
      state.on = action.payload
      persist(state, { on: action.payload })
    },
    updateTiming(state, action: PayloadAction<Timing>) {
      const timing = state.timings.find(t => t.dayOfTheWeek === action.payload.dayOfTheWeek)
      if (timing) {
        timing.startTime = action.payload.startTime
        timing.endTime = action.payload.endTime
        timing.enabled = action.payload.enabled
        persist(state, { timings: state.timings })
      }
    },
    startFetch(state, action: PayloadAction<void>) {
      state.busy = true
      state.persistError = null
    },
    finishFetch(state, action: PayloadAction<string | null>) {
      state.busy = false
      state.persistError = action.payload
    }
  }
})

export const {
  updateFullState,
  setOperationMode,
  setOnState,
  updateTiming,
  startFetch,
  finishFetch,
} = scheduleSlice.actions

export default scheduleSlice.reducer