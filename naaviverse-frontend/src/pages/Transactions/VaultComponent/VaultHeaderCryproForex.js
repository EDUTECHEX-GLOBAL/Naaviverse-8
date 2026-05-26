import React, { useEffect, useState } from 'react';
import classNames from './vaultsPage.module.scss';
import { useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import VaultSelectModal from './VaultSelectModal/index';
import { FormatCurrency } from './FunctionTools';
import { useNavigate } from "react-router-dom";
import { useStore } from '../../../components/store/store';

function VaultHeaderCryproForex({
  appSelected,
  setAppSelected,
  assetClass,
  email,
  vaultSelected,
  setVaultSelected,
  vaultsList,
  loading,
}) {
  const [openVaultModel, setOpenVaultModel] = useState(false);
  const { selectedCoin } = useStore();
  const { coinParam } = useParams();
  // const coinData = selectedCoin ?? vaultSelected;
  const coinData = vaultSelected ? vaultSelected : selectedCoin;
  const appCurrencySymbol = 'USD';

  useEffect(() => {
    // alert()
    
    // console.log("vaultsList",vaultsList)
    const vaultParam = vaultsList.filter(
      (vault) => vault.coinSymbol === coinParam
    )[0];
    const vault = vaultsList.filter(
      (vault) => vault.coinSymbol === vaultSelected?.coinSymbol
    )[0];
    const vaultInr = vaultsList.filter(
      (vault) => vault.coinSymbol === appCurrencySymbol
    )[0];
    const vaultDef = vaultsList[0];

    if (!loading && vaultsList) {
      if (vaultParam) {
        setVaultSelected(vaultParam);
      } else if (vault) {
        setVaultSelected(vault);
      } else if (vaultInr) {
        setVaultSelected(vaultInr);
      } else if (vaultDef) {
        setVaultSelected(vaultDef);
      } else {
        setVaultSelected();
      }
    }
  }, [vaultsList, coinParam]);

  return (
    <>
      <div className={classNames.vaultHeader}>
        <div className={classNames.vaultNbalance}>
          <div className={classNames.vault}>
            {loading ? (
              <Skeleton width={150} />
            ) : (
              <>{coinData?.coinName} Vault</>
            )}
          </div>
          <div className={classNames.balance}>
            {loading ? (
              <Skeleton width={250} />
            ) : (
              <>
                {FormatCurrency(coinData?.coinValue, coinData?.coinSymbol)}{' '}
                <small>
                  {appCurrencySymbol}&nbsp;
                  {FormatCurrency(coinData?.coinValue_DC, appCurrencySymbol)}
                </small>
              </>
            )}
          </div>
        </div>
        {/* <div className={classNames.coinSelect}>
          {loading ? (
            <>
              <Skeleton
                className={`${classNames.coinWrap} ${classNames.false}`}
              />
              <Skeleton
                className={`${classNames.coinWrap} ${classNames.false}`}
              />
              <Skeleton
                className={`${classNames.coinWrap} ${classNames.false}`}
              />
            </>
          ) : (
            <>
              {vaultsList
                ?.slice(0, 3)
                .filter(
                  (vault) => vault.coinSymbol === vaultSelected?.coinSymbol
                )[0] ? (
                ''
              ) : (
                <div className={`${classNames.coinWrap} ${classNames.true}`}>
                  <img src={vaultSelected?.coinImage} alt="" />
                </div>
              )}
              {vaultsList?.slice(0, 3).map((vault) => (
                <div
                  key={vault.coinSymbol}
                  className={`${classNames.coinWrap} ${
                    classNames[vault.coinSymbol === vaultSelected?.coinSymbol]
                  }`}
                  onClick={() => {
                    setVaultSelected(vault);
                    history.push(
                      `/vault/${assetClass.name}/${appSelected.app_code}/${vault.coinSymbol}`
                    );
                  }}
                >
                  <img src={vault?.coinImage} alt="" />
                </div>
              ))}
            </>
          )}
          <div
            className={classNames.coinWrap}
            onClick={() => {
              setOpenVaultModel(true);
            }}
          >
            <img
              src={searchIcon}
              alt=""
              style={{
                width: 26,
                height: 26,
              }}
            />
          </div>
        </div> */}
      </div>
      {openVaultModel && (
        <VaultSelectModal
          appSelected={appSelected}
          setAppSelected={setAppSelected}
          assetClass={assetClass}
          email={email}
          vaultSelected={vaultSelected}
          setVaultSelected={setVaultSelected}
          onSuccess={() => setOpenVaultModel(false)}
          onClose={() => setOpenVaultModel(false)}
        />
      )}
    </>
  );
}

export default VaultHeaderCryproForex;
