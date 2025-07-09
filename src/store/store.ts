import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './counterSlice'
import todoReducer from './todoSlice'
import towerDefenseReducer from './towerDefenseSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todoReducer,
    towerDefense: towerDefenseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 