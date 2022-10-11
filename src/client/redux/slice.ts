import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OperationMode, SchedulerState, Timing } from "./types";

const initialState: SchedulerState = {
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

const persist = async (state: any) => {
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    })
    if (response.ok) {
      return response.json();
    } 
    throw new Error(response.status.toString());
  } catch(err) {
    console.error(err);
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
      persist({ operationMode: action.payload })
    },
    setOnState(state, action: PayloadAction<boolean>) {
      state.on = action.payload
      persist({ on: action.payload })
    },
    updateTiming(state, action: PayloadAction<Timing>) {
      const timing = state.timings.find(t => t.dayOfTheWeek === action.payload.dayOfTheWeek)
      if (timing) {
        timing.startTime = action.payload.startTime
        timing.endTime = action.payload.endTime
        timing.enabled = action.payload.enabled
        persist({ timings: state.timings })
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