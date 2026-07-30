import React, { useCallback, useContext, useState } from 'react';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';
import axios from 'axios';
import classNames from './vaultControllPanelForex.module.scss';
import { ReactComponent as SendPlaneIcon } from '../../static/images/vaultCpanelIcons/sendPlane.svg';
import { ReactComponent as PlusIcon } from '../../static/images/vaultCpanelIcons/plusIcon.svg';
import { ReactComponent as ConnectIcon } from '../../static/images/vaultCpanelIcons/connect.svg';
import { ReactComponent as IndianOTCIcon } from '../../static/images/vaultCpanelIcons/indianOTC.svg';
import { ReactComponent as VaultIcon } from '../../static/images/vaultCpanelIcons/vault.svg';
import { VaultPageContext } from '../../../../context/VaultPageContext';
import { BankContext } from '../../../../context/Context';
import LoadingAnimCash from '../VaultControllPanel/LoadingAnimCash';
import { useFXSendMethods } from '../queryHooks';
import Skeleton from 'react-loading-skeleton';
import { useAppContextDetails } from '../../../../context/AppContext';

async function getQuoteOrBuy(paramData) {
  const { data } = await axios.post(
    'https://comms.globalxchange.io/coin/vault/service/trade/execute',
    paramData
  );
  return data;
}

function VaultControllPanelForex({ onClose = () => {}, appSelected }) {
  const { email, token, tostShowOn, profileId, coinListObject } =
    useContext(BankContext);
  const { vaultSelected, refetchData } = useContext(VaultPageContext);
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState();
  const [txnType, setTxnType] = useState('fund');
  const { appCode } = useAppContextDetails();

  const { data: paymentMethods, isLoading: loadingPaymentMethods } =
    useFXSendMethods(
      vaultSelected?.coinSymbol,
      vaultSelected?.coinSymbol,
      txnType
    );
  const { data: paymentMethodDetail, isLoading: loadingPaymentMethodDetail } =
    useFXSendMethods(
      vaultSelected?.coinSymbol,
      vaultSelected?.coinSymbol,
      txnType,
      paymentMethod?._id
    );

  const {
    isLoading,
    mutate: fnTrade,
    data,
  } = useMutation(getQuoteOrBuy, {
    onSuccess: (data) => {
      if (data.status) {
        setStep((step) => step + 1);
      } else {
        tostShowOn(data.message, 'Error!');
      }
    },
  });

  const breadCrumbs = [
    <>
      <span onClick={() => setStep(0)}>Actions</span>
    </>,
    <>
      &#8680;&nbsp;<span onClick={() => setStep(1)}>Origin</span>
    </>,
    <>
      &#8680;&nbsp;<span onClick={() => setStep(2)}>Method</span>
    </>,
    <>
      &#8680;&nbsp;<span onClick={() => setStep(3)}>Amount</span>
    </>,
    <>
      &#8680;&nbsp;<span onClick={() => setStep(4)}>Quote</span>
    </>,
  ];

  const getSteps = useCallback(() => {
    switch (step) {
      case 5:
        refetchData();
        setTimeout(() => {
          onClose();
        }, 500);
        return (
          <>
            <div className={classNames.scrollList}></div>
            <button
              className={classNames.btnFooter}
              onClick={() => {
                onClose();
              }}
            >
              Close Control Panel
            </button>
          </>
        );
      case 4:
        return (
          <>
            <div className={classNames.scrollList}>
              <div className={classNames.subTitle}>
                Sending Via {paymentMethod?.metadata?.name}
              </div>
              <div className={classNames.inpCoin}>
                <div className={classNames.coin}>
                  <img src={vaultSelected?.coinImage} alt="" />
                  <span>{vaultSelected?.coinSymbol}</span>
                </div>
                <input
                  className={classNames.input}
                  type="number"
                  value={amount}
                  readOnly
                />
              </div>
              <div className={classNames.spacer} />
              <div className={classNames.subTitle}>
                Crediting To {vaultSelected?.coinSymbol} Liquid Vault
              </div>
              <div className={classNames.inpCoin}>
                <div className={classNames.coin}>
                  <img src={vaultSelected?.coinImage} alt="" />
                  <span>{vaultSelected?.coinSymbol}</span>
                </div>
                <input
                  className={classNames.input}
                  type="number"
                  value={data?.finalToAmount}
                  readOnly
                />
              </div>
            </div>
            <button
              className={classNames.btnFooter}
              disabled={!amount}
              onClick={() => {
                fnTrade({
                  token,
                  email,
                  app_code: appSelected?.app_code || appCode,
                  profile_id: appSelected?.profile_id || profileId,
                  coin_purchased: vaultSelected?.coinSymbol,
                  purchased_from: vaultSelected?.coinSymbol,
                  from_amount: amount,
                  stats: false,
                  path_id: paymentMethodDetail?.paymentPaths[0]?.path_ids[0],
                });
              }}
            >
              Initiate Transaction <SendPlaneIcon className={classNames.icon} />
            </button>
          </>
        );
      case 3:
        return (
          <>
            <div className={classNames.scrollList}>
              <div className={classNames.subTitle}>
                How Much {vaultSelected?.coinSymbol} Are You Adding
              </div>
              <div className={classNames.inpCoin}>
                <div className={classNames.coin}>
                  <img src={vaultSelected?.coinImage} alt="" />
                  <span>{vaultSelected?.coinSymbol}</span>
                </div>
                <input
                  className={classNames.input}
                  type="number"
                  placeholder="00.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <button
              className={classNames.btnFooter}
              disabled={!amount}
              onClick={() => {
                fnTrade({
                  token,
                  email,
                  app_code: appSelected?.app_code || appCode,
                  profile_id: appSelected?.profile_id || profileId,
                  coin_purchased: vaultSelected?.coinSymbol,
                  purchased_from: vaultSelected?.coinSymbol,
                  from_amount: amount,
                  stats: true,
                  path_id: paymentMethodDetail?.paymentPaths[0]?.path_ids[0],
                });
              }}
            >
              Get Quote <SendPlaneIcon className={classNames.icon} />
            </button>
          </>
        );
      case 2:
        return (
          <>
            <div className={classNames.listTitle}>Select Transfer Method</div>
            <div className={classNames.scrollList}>
              {loadingPaymentMethods
                ? Array(12)
                    .fill('')
                    .map((_, i) => (
                      <div key={i} className={classNames.vaultItem}>
                        <Skeleton className={classNames.icon} circle />
                        <Skeleton width={140} />
                      </div>
                    ))
                : paymentMethods?.paymentMethod?.map((method) => (
                    <div
                      key={method._id}
                      className={classNames.vaultItem}
                      onClick={() => {
                        setPaymentMethod(method);
                        setStep(3);
                      }}
                    >
                      <img
                        className={classNames.icon}
                        src={method?.metadata?.icon}
                        alt=""
                      />
                      <span>{method?.metadata?.name}</span>
                    </div>
                  ))}
            </div>
            <div className={classNames.btnFooter} onClick={() => setStep(1)}>
              Go Back
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className={classNames.listTitle}>Adding Via</div>
            <div className={classNames.scrollList}>
              <div
                className={classNames.vaultItem}
                onClick={() => {}}
                style={{
                  opacity: 0.4,
                }}
              >
                <VaultIcon className={classNames.icon} />
                <span>Vault</span>
              </div>
              <div
                className={classNames.vaultItem}
                onClick={() => {
                  setStep(2);
                }}
              >
                <IndianOTCIcon className={classNames.icon} />
                <span>IndianOTC</span>
              </div>
              <div
                className={classNames.vaultItem}
                onClick={() => {}}
                style={{
                  opacity: 0.4,
                }}
              >
                <ConnectIcon className={classNames.icon} />
                <span>Connect</span>
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
              <div
                className={classNames.vaultItem}
                onClick={() => {
                  setStep(1);
                  setTxnType('fund');
                }}
              >
                <PlusIcon className={classNames.icon} />
                <span>Add {vaultSelected?.coinName}s</span>
              </div>
              <div
                className={classNames.vaultItem}
                onClick={() => {
                  setStep(1);
                  setTxnType('withdraw');
                }}
              >
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
  }, [step, vaultSelected, paymentMethods, loadingPaymentMethods, amount]);

  return (
    <div className={classNames.vaultControllPanelForex}>
      {!isLoading && (
        <div className={classNames.toggle} onClick={() => onClose()}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </div>
      )}
      <div className={classNames.header}>
        <div className={classNames.title}>Vault Control Panel</div>
        <div className={classNames.breadCrumbs}>
          {step === 5 ? (
            <div className={classNames.showArea}>
              <span>Transaction Success</span>
            </div>
          ) : (
            <>
              <div className={classNames.showArea}>
                {breadCrumbs
                  .slice(step - 2 < 0 ? 0 : step - 2, step + 1)
                  .map((itm) => itm)}
              </div>
              <div className={classNames.prevArea}>
                {breadCrumbs
                  .slice(0, step - 2 < 0 ? 0 : step - 2)
                  .map((itm) => itm)}
              </div>
            </>
          )}
        </div>
      </div>
      {getSteps()}
      {isLoading && (
        <div className={classNames.loadingAnim}>
          <LoadingAnimCash />
        </div>
      )}
    </div>
  );
}

export default VaultControllPanelForex;
