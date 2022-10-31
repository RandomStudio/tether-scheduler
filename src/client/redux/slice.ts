import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OperationMode, SchedulerState, Timing } from "./types";

const initialState: SchedulerState = {
  busy: false,
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

const persist = (state: any): Promise<void> => new Promise(async (resolve, reject) => {
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    })
    if (response.ok) {
      resolve();
    } else {
      throw new Error(response.status.toString());
    }
  } catch(err) {
    reject(err);
  }
})

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
      state.busy = true
      try {
        persist({ operationMode: action.payload })
      } catch (err) {
        console.error(err);
      } finally {
        state.busy = false
      }
    },
    setOnState(state, action: PayloadAction<boolean>) {
      state.on = action.payload
      state.busy = true
      try {
        persist({ on: action.payload })
      } catch (err) {
        console.error(err);
      } finally {
        state.busy = false
      }
    },
    updateTiming(state, action: PayloadAction<Timing>) {
      const timing = state.timings.find(t => t.dayOfTheWeek === action.payload.dayOfTheWeek)
      if (timing) {
        timing.startTime = action.payload.startTime
        timing.endTime = action.payload.endTime
        timing.enabled = action.payload.enabled
        state.busy = true
        try {
          persist({ timings: state.timings })
        } catch (err) {
          console.error(err);
        } finally {
          state.busy = false
        }
      }
    }
  }
})

export const {
  updateFullState,
  setOperationMode,
  setOnState,
  updateTiming,
} = scheduleSlice.actions

export default scheduleSlice.reducer