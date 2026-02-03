import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LoginState {
  email: String;
  token: String;
  accesToken: String;
  deviceId: String;
  refreshToken: String;
}

const initialState: LoginState = {
  email: "",
  token: "",
  accesToken: "",
  deviceId: "",
  refreshToken: "",
};

export const loginSlice = createSlice({
  name: "loginData",
  initialState,
  reducers: {
    logout: (state) => {
      state.email = "";
      state.token = "";
      state.accesToken = "";
      state.deviceId = "";
      state.refreshToken = "";
    },
    login: (state, action: PayloadAction<LoginState>) => {
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.accesToken = action.payload.accesToken;
      state.deviceId = action.payload.deviceId;
      state.refreshToken = action.payload.refreshToken;
    },
  },
});

export const { logout, login } = loginSlice.actions;

export const selectLoginData = (state: any) => state.loginData;

export default loginSlice.reducer;
