import { configureStore } from "@reduxjs/toolkit"
import scheduleReducer from "./slice"

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer
  }
})

export type RootState = ReturnType<typeof store.getState>