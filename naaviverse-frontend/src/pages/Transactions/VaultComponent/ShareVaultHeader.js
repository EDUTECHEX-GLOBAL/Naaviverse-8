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

function ShareVaultHeader({
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
  const history = useNavigate();
  // const coinData = selectedCoin ?? vaultSelected;
  const coinData = vaultSelected ? vaultSelected : selectedCoin;
  const { appCurrencySymbol, shareTokenSelected } = useAppContextDetails();
  //   const {
  //     cardSelected,
  //     setCardSelected,
  //     tokenSymbol,
  //     setTokenSymbol,
  //     selectedAppCode,
  //     setSelectedAppCode,
  //     setshareTokenSelected,
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
  console.log('shareTokenSelected', shareTokenSelected);
  return (
    <>
      <div className={classNames.vaultHeader}>
        <div className={classNames.vaultNbalance}>
          <div className={classNames.balance}>
            <>
              {FormatCurrency(
                shareTokenSelected?.value,
                shareTokenSelected?.token_profile_data?.coinSymbol
              )}{' '}
              {/* {shareTokenSelected?.value} */}
              <small>
                {FormatCurrency(
                  shareTokenSelected?.value_in_asset,
                  shareTokenSelected?.token_profile_data?.coinSymbol
                )}{' '}
                 {shareTokenSelected?.asset}
              </small>
            </>
          </div>
          <div className={classNames.vault}>
            <>{shareTokenSelected?.token_profile_data?.coinName} Vault</>
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

export default ShareVaultHeader;
