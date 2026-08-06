import React, { useContext, useState } from 'react';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';
import axios from 'axios';
import classNames from './vaultControllPanel.module.scss';
import { ReactComponent as SendPlaneIcon } from '../../static/images/vaultCpanelIcons/sendPlane.svg';
import { VaultPageContext } from '../../../../context/VaultPageContext';
import { BankContext } from '../../../../context/Context';
import LoadingAnimCash from './LoadingAnimCash';
import {
  useUserBondsList,
  useUserMoneMarketsList,
  useUserVaults,
} from '../queryHooks';
import { FormatCurrency } from '../FunctionTools';
import { useAppContextDetails } from '../../../../context/AppContext';

async function withdrawMoneyMarket(paramData) {
  const { data } = await axios.post(
    'https://comms.globalxchange.io/coin/vault/service/user/app/interest/withdraw',
    paramData
  );
  return data;
}

async function withdrawBonds(paramData) {
  const { data } = await axios.post(
    'https://comms.globalxchange.io/coin/iced/interest/withdraw',
    paramData
  );
  return data;
}

function VaultControllPanel({ onClose = () => {} }) {
  const { email, token, tostShowOn, iceProfileId, coinListObject } =
    useContext(BankContext);
  const { assetClass, appSelected, vaultSelected, refetchData } =
    useContext(VaultPageContext);
  const { appCurrencyName } = useAppContextDetails();

  const [step, setStep] = useState(0);
  const [txnValue, setTxnValue] = useState();
  // console.log(appCurrencyName, 'from VaultControlPanel');

  const { data: vaultsList = [], refetch: refetchVaults } = useUserVaults(
    email,
    vaultSelected?.type,
    appSelected?.app_code,
    undefined,
    undefined,
    appCurrencyName
  );

  const {
    data: vaultsListMM,
    isLoading: loadingVaultsMM,
    refetch: refetchVaultsMM,
  } = useUserMoneMarketsList(email, appSelected?.app_code, appCurrencyName);

  const {
    data: vaultsListBonds,
    isLoading: loadingVaultsBonds,
    refetch: refetchVaultsBonds,
  } = useUserBondsList(email, appCurrencyName);

  const { isLoading: loadingMM, mutate: fnWithdrawMM } = useMutation(
    withdrawMoneyMarket,
    {
      onSuccess: (data) => {
        if (data.status) {
          setStep(3);
          refetchVaults();
          refetchVaultsMM();
          refetchData();
        } else {
          tostShowOn(data.message, 'Error!');
        }
      },
    }
  );
  const { isLoading: loadingBond, mutate: fnWithdrawBond } = useMutation(
    withdrawBonds,
    {
      onSuccess: (data) => {
        if (data.status) {
          setStep(3);
          refetchVaults();
          refetchVaultsBonds();
          refetchData();
        } else {
          tostShowOn(data.message, 'Error!');
        }
      },
    }
  );

  function withdraw() {
    switch (assetClass?.name) {
      case 'moneyMarkets':
        fnWithdrawMM({
          email,
          token,
          app_code: appSelected?.app_code,
          profile_id: appSelected?.profile_id,
          coin: vaultSelected?.coinSymbol,
          amount: txnValue,
        });
        break;
      case 'bonds':
        fnWithdrawBond({
          email,
          token,
          app_code: 'ice',
          profile_id: iceProfileId,
          coin: vaultSelected?.coinSymbol,
          amount: txnValue,
          toAppcode: 'naavi',
        });
        break;

      default:
        break;
    }
  }

  const breadCrumbs = [
    <>
      <span>Actions</span>
    </>,
    <>
      &#8680;&nbsp;<span>Destination</span>
    </>,
    <>
      &#8680;&nbsp;<span>Amount</span>
    </>,
  ];
  function getSteps() {
    switch (step) {
      case 3:
        return (
          <>
            <div className={classNames.scrollList}>
              {assetClass.name === 'moneyMarkets' && (
                <>
                  <div className={classNames.subTitle}>
                    {vaultSelected?.coinSymbol} MoneyMarkets Earning Vault
                    Balance
                  </div>
                  {vaultsListMM
                    ?.filter(
                      (coin) => coin.coinSymbol === vaultSelected?.coinSymbol
                    )
                    ?.map((vaultCoin) => (
                      <div className={classNames.inputWrap}>
                        <div className={classNames.inpCoin}>
                          <div className={classNames.coin}>
                            <img src={vaultCoin?.coinImage} alt="" />
                            <span>{vaultCoin?.coinSymbol}</span>
                          </div>
                          <div className={classNames.input}>
                            {FormatCurrency(
                              vaultCoin?.coinValue,
                              vaultCoin.coinSymbol
                            )}
                          </div>
                        </div>
                        <div className={classNames.inpCoin}>
                          <div className={classNames.coin}>
                            <img
                              src={coinListObject?.[appCurrencyName]?.coinImage}
                              alt=""
                            />
                            <span>
                              {coinListObject?.[appCurrencyName]?.coinSymbol}
                            </span>
                          </div>
                          <div className={classNames.input}>
                            {FormatCurrency(
                              vaultCoin?.coinValue_dc,
                              appCurrencyName
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
              {assetClass.name === 'bonds' && (
                <>
                  <div className={classNames.subTitle}>
                    {vaultSelected?.coinSymbol} Bond Earning Vault Balance
                  </div>
                  {vaultsListBonds?.balances
                    ?.filter(
                      (coin) => coin.coinSymbol === vaultSelected?.coinSymbol
                    )
                    ?.map((vaultCoin) => (
                      <div className={classNames.inputWrap}>
                        <div className={classNames.inpCoin}>
                          <div className={classNames.coin}>
                            <img src={vaultCoin?.coinImage} alt="" />
                            <span>{vaultCoin?.coinSymbol}</span>
                          </div>
                          <div className={classNames.input}>
                            {FormatCurrency(
                              vaultCoin?.coinValue,
                              vaultCoin.coinSymbol
                            )}
                          </div>
                        </div>
                        <div className={classNames.inpCoin}>
                          <div className={classNames.coin}>
                            <img
                              src={coinListObject?.[appCurrencyName]?.coinImage}
                              alt=""
                            />
                            <span>
                              {coinListObject?.[appCurrencyName]?.coinSymbol}
                            </span>
                          </div>
                          <div className={classNames.input}>
                            {FormatCurrency(
                              vaultCoin?.value_in_displayCurrency,
                              appCurrencyName
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}
              <>
                <div className={classNames.subTitle}>
                  {vaultSelected?.coinSymbol} Liquid Vault Balance
                </div>
                {vaultsList
                  ?.filter(
                    (coin) => coin.coinSymbol === vaultSelected?.coinSymbol
                  )
                  ?.map((vaultCoin) => (
                    <div className={classNames.inputWrap}>
                      <div className={classNames.inpCoin}>
                        <div className={classNames.coin}>
                          <img src={vaultCoin?.coinImage} alt="" />
                          <span>{vaultCoin?.coinSymbol}</span>
                        </div>
                        <div className={classNames.input}>
                          {FormatCurrency(
                            vaultCoin?.coinValue,
                            vaultCoin.coinSymbol
                          )}
                        </div>
                      </div>
                      <div className={classNames.inpCoin}>
                        <div className={classNames.coin}>
                          <img
                            src={coinListObject?.[appCurrencyName]?.coinImage}
                            alt=""
                          />
                          <span>
                            {coinListObject?.[appCurrencyName]?.coinSymbol}
                          </span>
                        </div>
                        <div className={classNames.input}>
                          {FormatCurrency(
                            vaultCoin?.coinValue_DC,
                            appCurrencyName
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            </div>
            <button
              className={classNames.btnFooter}
              disabled={!txnValue}
              onClick={() => onClose()}
            >
              Close Control Panel
            </button>
          </>
        );
      case 2:
        return (
          <>
            <div className={classNames.scrollList}>
              <div className={classNames.subTitle}>
                From {vaultSelected?.coinSymbol} {assetClass?.label} Vault
              </div>
              <div className={classNames.inpCoin}>
                <div className={classNames.coin}>
                  <img src={vaultSelected?.coinImage} alt="" />
                  <span>{vaultSelected?.coinSymbol}</span>
                </div>
                <input
                  type="number"
                  className={classNames.input}
                  placeholder="0.0000"
                  value={txnValue}
                  onChange={(e) => setTxnValue(e.target.value)}
                />
              </div>
              <div className={classNames.subTitle}>
                To {vaultSelected?.coinSymbol} Liquid Vault
              </div>
              <div className={classNames.inpCoin}>
                <div className={classNames.coin}>
                  <img src={vaultSelected?.coinImage} alt="" />
                  <span>{vaultSelected?.coinSymbol}</span>
                </div>
                <input
                  type="number"
                  className={classNames.input}
                  placeholder="0.0000"
                  value={txnValue}
                  onChange={(e) => setTxnValue(e.target.value)}
                />
              </div>
              <div className={classNames.percents}>
                <div
                  className={classNames.percent}
                  onClick={() => {
                    setTxnValue('');
                  }}
                >
                  Custom
                </div>
                <div
                  className={classNames.percent}
                  onClick={() => {
                    setTxnValue(vaultSelected?.coinValue);
                  }}
                >
                  100%
                </div>
              </div>
            </div>
            <button
              className={classNames.btnFooter}
              disabled={!txnValue}
              onClick={() => withdraw()}
            >
              Confirm Transaction
              <SendPlaneIcon className={classNames.icon} />
            </button>
          </>
        );
      case 1:
        return (
          <>
            <div className={classNames.listTitle}>Select Destination</div>
            <div className={classNames.scrollList}>
              <div className={classNames.vaultItem} onClick={() => setStep(2)}>
                <img
                  src={vaultSelected?.coinImage}
                  alt=""
                  className={classNames.icon}
                />
                <span>Liquid {vaultSelected?.coinName} Vault</span>
              </div>
            </div>
            <div className={classNames.btnFooter} onClick={() => setStep(0)}>
              Go Back
            </div>
          </>
        );

      default:
        return (
          <>
            <div className={classNames.listTitle}>Select An Action</div>
            <div className={classNames.scrollList}>
              <div className={classNames.vaultItem} onClick={() => setStep(1)}>
                <SendPlaneIcon className={classNames.icon} />
                <span>Send {vaultSelected?.coinName}s</span>
              </div>
            </div>
            <div className={classNames.btnFooter} onClick={() => onClose()}>
              Close Control Panel
            </div>
          </>
        );
    }
  }

  return (
    <div className={classNames.vaultControllPanel}>
      {!(loadingMM || loadingBond) && (
        <div className={classNames.toggle} onClick={() => onClose()}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </div>
      )}
      <div className={classNames.header}>
        <div className={classNames.title}>Vault Control Panel</div>
        <div className={classNames.breadCrumbs}>
          {step === 3 ? (
            <span>Success</span>
          ) : (
            breadCrumbs.slice(0, step + 1).map((itm) => itm)
          )}
        </div>
      </div>
      {getSteps()}
      {(loadingMM || loadingBond) && (
        <div className={classNames.loadingAnim}>
          <LoadingAnimCash />
        </div>
      )}
    </div>
  );
}

export default VaultControllPanel;
