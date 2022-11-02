import { configureStore } from "@reduxjs/toolkit"
import { logger } from "@randomstudio/tether"
import { readFile, writeFile } from "fs/promises"
import scheduleReducer, { applyState } from "./slice"

export const store = configureStore({
  reducer: {
    schedule: scheduleReducer
  }
})

export const hydrateStore = async (filePath: string) => {
  try {
    const contents = await readFile(filePath)
    if (contents) {
      const data = JSON.parse(contents.toString())
      if (!Object.keys(data).includes("schedule")) {
        logger.warn(`Cannot hydrate store with loaded data; key "schedule" is missing.`)
      } else {
        const { schedule } = data
        store.dispatch(applyState(schedule))
      }
    }
    else {
      throw new Error('No file contents')
    }
  } catch(err) {
    console.log(`Could not read contents from file ${filePath}.`, err)
  }
}

export const persistStore = async (filePath: string) => {
  return writeFile(filePath, JSON.stringify(store.getState(), null, '\t'))
}

export type RootState = ReturnType<typeof store.getState>