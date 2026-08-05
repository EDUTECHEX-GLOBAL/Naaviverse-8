import React, { useContext } from 'react';
import VaultControls from './VaultControls';
import VaultControlBonds from './VaultControlBonds';
import VaultControlShares from './VaultControlShares';
import VaultTransactions from './VaultTransactions';
import VaultTransactionsBonds from './VaultTransactionsBonds';
import VaultTransactionsMoneyMarkets from './VaultTransactionsMoneyMarkets';
import VaultTransactionsShares from './VaultTransactionsShares';
import { VaultPageContext } from '../../../context/VaultPageContext';
import { BankContext } from '../../../context/Context';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import TrackerTransactions from './TrackerTransactions';
import TrackerControls from './TrackerControls';
import Overlay from './VaultSideComponents/Overlay';
import TrackerImageAdd from './VaultSideComponents/TrackerImageAdd';
import '../../../static/scss/trackerDetailed.scss';
import usFlag from './temp/usflag.svg';
import Skeleton from 'react-loading-skeleton';
import moment from 'moment';

export const TrackerDetailed = () => {
  const { email } = useContext(BankContext);

  const {
    assetClass,
    appSelected,
    setAppSelected,
    vaultSelected,
    setVaultSelected,
    vaultsListFxCrypto: vaultsList,
    vaultsListFxCryptoLoading: loading,
    setassetDropdown,
    setstatusDropdown,
    assetDropdown,
    statusDropdown,
    trackerImageOpen,
    settrackerImageOpen,
    trackingImage,
    setTrackingImage,
    trackerData,
    transactionDetail,
    transactionDetailSteps,
    transactionDetailStepsLoading,
    setTransactionDetailStepsLoading,
  } = useContext(VaultPageContext);

  const coinData = trackerData?.perCoin?.filter(
    (eachCoin) => eachCoin?.coin == transactionDetail?.sell_to_deposit
  );

  const bankerData = trackerData?.perBanker?.filter((eachBanker) =>
    eachBanker?.banker_tag
      ?.toLowerCase()
      ?.includes(transactionDetail?.banker?.toLowerCase())
  );

  return (
    <div className={classNames.contentArea} style={{ height: '88%' }}>
      <div className="trackerDetailed" style={{ height: '100%' }}>
        <div className="trackerDetailed-left">
          <div>
            <div className="title">Sending</div>
            <div className="cardContainer">
              <img
                src={coinData?.length > 0 ? coinData[0]?.coin_logo : usFlag}
                alt="usFlag"
                className="roundedimage"
              />
              <div className="contentDiv">
                <div>
                  $
                  {transactionDetail
                    ? transactionDetail?.sell_amount?.toFixed(2) +
                      ' ' +
                      transactionDetail?.sell_to_deposit
                    : '0.00'}
                </div>
                <div>
                  Initiated on{' '}
                  {moment(transactionDetail?.date).format(
                    'MMMM Do YYYY, h:mm:ss A'
                  )}{' '}
                  IST
                </div>
              </div>
            </div>
            <div className="detailsContainer">
              <div>
                <div>AiProWallet Fixed</div>
                <div>
                  $
                  {transactionDetail
                    ? transactionDetail?.fee_breaking?.gx_fixed_fee?.toFixed(2)
                    : '0.00'}
                </div>
              </div>
              <div>
                <div>AiProWallet Variable</div>
                <div>
                  {transactionDetail
                    ? transactionDetail?.fee_breaking?.gx_trade_fee?.toFixed(2)
                    : '0.00'}
                  %
                </div>
              </div>
              <div>
                <div>X3 Fixed</div>
                <div>
                  $
                  {transactionDetail
                    ? transactionDetail?.fee_breaking?.banker_fixed_fee?.toFixed(
                        2
                      )
                    : '0.00'}
                </div>
              </div>
              <div>
                <div>X3 Variable</div>
                <div>
                  {transactionDetail
                    ? transactionDetail?.fee_breaking?.banker_trade_fee?.toFixed(
                        2
                      )
                    : '0.00'}
                  %
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="title">Receiving</div>
            <div className="cardContainer">
              <img
                src={coinData?.length > 0 ? coinData[0]?.coin_logo : usFlag}
                alt="usFlag"
                className="roundedimage"
              />
              <div className="contentDiv">
                <div>
                  $
                  {transactionDetail
                    ? transactionDetail?.buy_amount?.toFixed(2) +
                      ' ' +
                      transactionDetail?.buy_to_deposit
                    : ''}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="title">Payment Method</div>
            <div className="cardContainer">
              <img
                src={
                  transactionDetail?.payment_method
                    ? transactionDetail?.payment_method?.icon
                    : usFlag
                }
                alt="usFlag"
                className="squareimage"
              />
              <div className="contentDiv">
                <div>
                  {transactionDetail?.payment_method
                    ? transactionDetail?.payment_method?.name
                    : ''}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="title">Exchange</div>
            <div className="cardContainer">
              <img
                src={
                  bankerData?.length > 0
                    ? bankerData[0]?.banker_profilePic
                    : usFlag
                }
                alt="usFlag"
                className="squareimage"
              />
              <div className="contentDiv">
                <div>
                  {bankerData?.length > 0 ? bankerData[0]?.banker_name : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="trackerDetailed-right">
          {transactionDetailStepsLoading
            ? Array(10)
                .fill(' ')
                .map((item, index) => {
                  return <StepDivLoading />;
                })
            : transactionDetailSteps?.length > 0
            ? transactionDetailSteps?.map((eachStep, i) => {
                return <StepDiv {...eachStep} index={i + 1} />;
              })
            : ''}
        </div>
      </div>
      {trackerImageOpen && <Overlay />}
      {trackerImageOpen && <TrackerImageAdd />}
    </div>
  );
};

const StepDiv = ({ publicname, description, bankaccountid, index }) => {
  const { bankAccountId, setBankAccountId, setTrackerSidebarMenu } =
    useContext(BankContext);
  return (
    <div className="stepDiv">
      <div className="title">
        Step {index}: {publicname}
      </div>
      <div className="para">{description}</div>
      <div
        className="btn"
        style={{ display: bankaccountid ? '' : 'none' }}
        onClick={() => {
          if (bankAccountId) {
            setBankAccountId('');
          }
          setBankAccountId(bankaccountid);
          setTrackerSidebarMenu(true);
        }}
      >
        See Payment Details
      </div>
    </div>
  );
};
const StepDivLoading = () => {
  return (
    <div className="stepDiv">
      <div className="title">
        <Skeleton />
      </div>
      <div className="para">
        {' '}
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    </div>
  );
};
