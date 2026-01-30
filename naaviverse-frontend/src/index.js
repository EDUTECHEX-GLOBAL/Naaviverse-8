import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./static/master.scss";
import "./assets/main.scss";

import MainContextProvider from "./context/Context";
import AppContextProvider from "./context/AppContext";
import { GlobalContexProvider } from "./globalContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { CoinContextProvider } from "./context/CoinContext";
import VaultPageContextProvider from "./context/VaultPageContext";
import { store } from "./app/store.ts";
import { Provider } from "react-redux";
import { saveState } from "./app/browser-storage.ts";
import ContextProvider from "./pages/dashboard/WalletScan/globalComponents/Context/Context";
import { GlobalContexProvider1 } from "./pages/dashboard/WalletScan/globalContext";
import RegistrationContextProvider from "./RegistrationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

store.subscribe(() => {
  saveState(store.getState().loginData);
});

root.render(
  <QueryClientProvider client={queryClient}>
    <RegistrationContextProvider>
      <AppContextProvider>
        <MainContextProvider>
          <CoinContextProvider>
            <VaultPageContextProvider>
              <GlobalContexProvider>
                <GlobalContexProvider1>
                  <ContextProvider>
                    <React.StrictMode>
                      <Provider store={store}>
                        <App />
                      </Provider>
                    </React.StrictMode>
                  </ContextProvider>
                </GlobalContexProvider1>
              </GlobalContexProvider>
            </VaultPageContextProvider>
          </CoinContextProvider>
        </MainContextProvider>
      </AppContextProvider>
    </RegistrationContextProvider>
  </QueryClientProvider>
);
