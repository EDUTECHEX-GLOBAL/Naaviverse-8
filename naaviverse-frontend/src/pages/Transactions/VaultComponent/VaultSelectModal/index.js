import React, { useState } from 'react';
import classNames from './vaultSelectModal.module.scss';
import { useUserApps, useUserVaults } from '../queryHooks';
import { FormatCurrency } from '../FunctionTools';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from "react-router-dom";

function VaultSelectModal({
  onClose = () => {},
  onSuccess = () => {},
  assetClass,
  email,
  appSelected,
  setAppSelected,
  vaultSelected,
  setVaultSelected,
}) {
  const [appSearch, setAppSearch] = useState('');
  const [vaultSearch, setVaultSearch] = useState('');
  const appCurrencyName = 'USD';
  const { data: appList = [], isLoading: appListLoadinng } = useUserApps(email);
  const { data: vaultsList = [], isLoading: vaultListLoading } = useUserVaults(
    email,
    assetClass?.name,
    appSelected?.app_code,
    undefined,
    undefined,
    appCurrencyName
  );
  const history = useNavigate();

  return (
    <div className={classNames.vaultSelectModal}>
      <div
        className={classNames.overlayClose}
        onClick={() => {
          try {
            onClose();
          } catch (error) {}
        }}
      />
      <div className={classNames.vaultSelectCard}>
        <div className={classNames.header}>
          <img src={assetClass.icon} alt="" className={classNames.headIcon} />
        </div>
        <div className={classNames.headBar}>
          <input
            type="text"
            name="search"
            className={classNames.search}
            placeholder="Search Your Apps..."
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
          />
          <div className={classNames.appList}>
            {appListLoadinng
              ? Array(6)
                  .fill('')
                  .map((_, i) => (
                    <div
                      className={`${classNames.appCard} ${classNames.true}`}
                      key={i}
                    >
                      <Skeleton className={classNames.icon} />
                    </div>
                  ))
              : appList
                  .filter(
                    (app) =>
                      app.app_name
                        .toLowerCase()
                        .includes(appSearch.toLowerCase()) ||
                      app.app_code
                        .toLowerCase()
                        .includes(appSearch.toLowerCase())
                  )
                  .map((app) => (
                    <div
                      className={`${classNames.appCard} ${
                        classNames[appSelected?.app_code === app.app_code]
                      }`}
                      key={app.app_code}
                      onClick={() => {
                        setAppSelected(app);
                        // history.push(
                        //   `/vault/${assetClass.name}/${app.app_code}/`
                        // );
                      }}
                    >
                      <img
                        src={app.app_icon}
                        alt={app.app_name}
                        className={classNames.icon}
                      />
                    </div>
                  ))}
          </div>
          <input
            type="text"
            name="search"
            className={classNames.search}
            style={{
              paddingLeft: '40px',
            }}
            placeholder="Search Your Vaults..."
            onChange={(e) => setVaultSearch(e.target.value)}
            value={vaultSearch}
          />
        </div>
        <div className={classNames.tableHeader}>
          <div className={classNames.asset}>Asset</div>
          <div className={classNames.balance}>Balance</div>
          <div className={classNames.value}>Value</div>
        </div>
        <div className={classNames.tableView}>
          {vaultListLoading
            ? Array(10)
                .fill('')
                .map((_, i) => (
                  <div key={i} className={classNames.tableItem}>
                    <div className={classNames.asset}>
                      <Skeleton className={classNames.img} circle />
                      <Skeleton width={200} />
                    </div>
                    <div className={classNames.balance}>
                      <Skeleton width={150} />
                    </div>
                    <div className={classNames.value}>
                      <Skeleton width={150} />
                    </div>
                  </div>
                ))
            : vaultsList
                .filter(
                  (vault) =>
                    vault.coinSymbol
                      .toLowerCase()
                      .includes(vaultSearch.toLowerCase()) ||
                    vault.coinName
                      .toLowerCase()
                      .includes(vaultSearch.toLowerCase())
                )
                .map((vault) => (
                  <div
                    key={vault.coinSymbol}
                    className={`${classNames.tableItem} ${
                      classNames[vault === vaultSelected]
                    }`}
                    onClick={() => {
                      setVaultSelected(vault);
                      history(
                        `/vault/${assetClass.name}/${appSelected.app_code}/${vault.coinSymbol}`
                      );
                      onSuccess();
                    }}
                  >
                    <div className={classNames.asset}>
                      <img
                        className={classNames.img}
                        src={vault.coinImage}
                        alt=""
                      />
                      <span>{vault.coinName}</span>
                    </div>
                    <div className={classNames.balance}>
                      <span>
                        {FormatCurrency(vault.coinValue, vault.coinSymbol)}
                        <small>{vault.coinSymbol}</small>
                      </span>
                    </div>
                    <div className={classNames.value}>
                      <span>
                        {FormatCurrency(vault.coinValue_DC, appCurrencyName)}
                        <small>{appCurrencyName}</small>
                      </span>
                    </div>
                  </div>
                ))}
        </div>
      </div>
    </div>
  );
}

export default VaultSelectModal;
