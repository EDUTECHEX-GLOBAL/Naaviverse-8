import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./static/master.scss";
import "./assets/main.scss";

import MainContextProvider from "./context/Context";
import AppContextProvider from "./context/AppContext";
import { GlobalContexProvider } from "./globalContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { CoinContextProvider } from "./context/CoinContext";
import VaultPageContextProvider from "./context/VaultPageContext";
import LogoutManager from "./components/LogoutModal/LogoutManager";
import { store } from "./app/store.ts";
import { Provider } from "react-redux";
import { saveState } from "./app/browser-storage.ts";
import ContextProvider from "./pages/dashboard/WalletScan/globalComponents/Context/Context";
import { GlobalContexProvider1 } from "./pages/dashboard/WalletScan/globalContext";
import RegistrationContextProvider from "./RegistrationContext";
// Preserve per-account cart keys across logout handlers and authentication cleanup
if (typeof window !== "undefined") {
  const protectStorageClear = (storage) => {
    try {
      if (!storage || typeof storage.clear !== "function") return;
      const origClear = storage.clear.bind(storage);
      storage.clear = function () {
        const preserved = [];
        try {
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (
              key &&
              (key.startsWith("naavi_marketplace_cart") ||
                key.startsWith("marketplaceCart_") ||
                key.startsWith("cart_") ||
                key.startsWith("naavi_step_feedback_") ||
                key.startsWith("stepFeedback_"))
            ) {
              preserved.push({ key, value: storage.getItem(key) });
            }
          }
        } catch (e) {
          // ignore scan error
        }
        origClear();
        preserved.forEach(({ key, value }) => {
          if (value !== null) {
            try {
              storage.setItem(key, value);
            } catch (e) {
              // ignore write error
            }
          }
        });
      };
    } catch (e) {
      // ignore wrapper setup error
    }
  };

  protectStorageClear(window.localStorage);
  protectStorageClear(window.sessionStorage);
}

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
                      <HelmetProvider>
                        <Provider store={store}>
                          <App />
                          <LogoutManager />
                        </Provider>
                      </HelmetProvider>
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
