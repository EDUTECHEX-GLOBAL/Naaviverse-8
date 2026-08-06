import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TerminalsState {
  pair: string;
  pairPrice: number;
  quoteCoin: string;
}

const initialState: TerminalsState = {
  pair: "",
  pairPrice: 0,
  quoteCoin: "",
};

export const terminalsSlice = createSlice({
  name: "terminalsData",
  initialState,
  reducers: {
    setPair: (
      state,
      action: PayloadAction<{ pair: string; pairPrice: number }>
    ) => {
      state.pair = action.payload.pair;
      state.pairPrice = action.payload.pairPrice;
    },
    setQuoteCoin: (state, action: PayloadAction<string>) => {
      state.quoteCoin = action.payload;
    },
  },
});

export const { setPair, setQuoteCoin } = terminalsSlice.actions;

export const selectTerminalsData = (state: any) => state.terminalsData;

export default terminalsSlice.reducer;
