import React, { useEffect, useState } from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import { useParams } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import VaultSelectModal from '../../VaultSelectModal';
import { FormatCurrency } from '../../../utils/FunctionTools';
import searchIcon from '../../../static/images/search.svg';
import { useCoinContextData } from '../../../context/CoinContext';
import { useAppContextDetails } from '../../../context/AppContext';
import { useNavigate } from "react-router-dom";

function DividentHeader({
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
  const { selectedCoin } = useCoinContextData();
  const { coinParam } = useParams();
  const navigate = useNavigate();
  // const coinData = selectedCoin ?? vaultSelected;
  const coinData = vaultSelected ? vaultSelected : selectedCoin;
  const { appCurrencySymbol, Divident } = useAppContextDetails();
  //   const {
  //     cardSelected,
  //     setCardSelected,
  //     tokenSymbol,
  //     setTokenSymbol,
  //     selectedAppCode,
  //     setSelectedAppCode,
  //     setDivident,
  //   } = useAppContextDetails();
  useEffect(() => {
    // alert()

    // console.log('vaultsList', vaultsList);
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
  console.log('Divident', Divident);
  return (
    <>
      <div className={classNames.vaultHeader}>
        <div className={classNames.vaultNbalance}>
          <div className={classNames.balance}>
            <>
              {/* {FormatCurrency(
              txn?.deposit
                ? assetClass.name === 'fiat'
                  ? Divident?.amt_credited
                  : txn.amount
                : 0,
              txn?.coin
            )} */}
              {FormatCurrency(Divident?.userCoinValue, Divident?.coinSymbol)}{' '}
              {/* {Divident?.value} */}
              <small>
                {FormatCurrency(
                  Divident?.userCoinValueUSD,
                  Divident?.coinSymbol
                )}{' '}
             {Divident?.coinSymbol}
              </small>
            </>
          </div>
          <div className={classNames.vault}>
            <>Dividend Vault</>
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

export default DividentHeader;
