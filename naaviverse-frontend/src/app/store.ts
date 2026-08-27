import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import loginReducer from "./loginSlice.ts";
import { loadState } from "./browser-storage.ts";
import terminalsSlice from "./terminalsSlice.ts";

const reducers = combineReducers({
  loginData: loginReducer,
  terminalsData: terminalsSlice,
});

export const store = configureStore({
  devTools: true,
  reducer: reducers,
  preloadedState: loadState(),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
