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
      enabled: true
    },
    {
      dayOfTheWeek: 1,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
    {
      dayOfTheWeek: 2,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
    {
      dayOfTheWeek: 3,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
    {
      dayOfTheWeek: 4,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
    {
      dayOfTheWeek: 5,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
    {
      dayOfTheWeek: 6,
      startTime: { hours: 9, minutes: 0 },
      endTime: { hours: 21, minutes: 0 },
      enabled: true
    },
  ]
}

const scheduleSlice = createSlice({
  name: "schedule",
  initialState,
  reducers: {
    setOperationMode(state, action: PayloadAction<OperationMode>) {
      state.operationMode = action.payload
    },
    setOnState(state, action: PayloadAction<boolean>) {
      state.on = action.payload
    },
    updateTiming(state, action: PayloadAction<Timing>) {
      const timing = state.timings.find(t => t.dayOfTheWeek === action.payload.dayOfTheWeek)
      if (timing) {
        timing.startTime = action.payload.startTime
        timing.endTime = action.payload.endTime
        timing.enabled = action.payload.enabled
      }
    }
  }
})

export const {
  setOperationMode,
  setOnState,
  updateTiming,
} = scheduleSlice.actions

export default scheduleSlice.reducer