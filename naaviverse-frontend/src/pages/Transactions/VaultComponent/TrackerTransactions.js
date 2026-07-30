import React, {
  useRef,
  useContext,
  Fragment,
  useState,
  useEffect,
} from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import { VaultPageContext } from '../../../context/VaultPageContext';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { YesterdayToday } from '../../../utils/FunctionTools';
import VaultItemForexCrypto from './VaultItemForexCrypto';

// temp
import usFlag from './temp/usflag.svg';
import bitcoinIcon from './temp/bitcoin.svg';
import interacLogo from '../../../static/images/interac.svg';
import { useCoinContextData } from '../../../context/CoinContext';
import { BankContext } from '../../../context/Context';

function TrackerTransactions({ loading }) {
  const {
    txnListFxCrypto: txnList,
    txnListLoadingFxCrypto: txnListLoading,
    trackerData,
    trackerDataLoading,
    settrackerImageOpen,
  } = useContext(VaultPageContext);
  const { trackerType } = useCoinContextData();
  const date = useRef();

  return (
    <Scrollbars className={classNames.vaultsView}>
      {trackerDataLoading || loading
        ? Array(3)
            .fill('')
            .map((_, i) => (
              <>
                <Skeleton className={classNames.day} width={200} key={i} />
                {Array(4)
                  .fill('')
                  .map((_, i) => (
                    <div className={classNames.vaultItmWrap}>
                      <div className={classNames.vaultsItm}>
                        <Skeleton className={classNames.img} />
                        <div className={classNames.nameDate}>
                          <Skeleton className={classNames.name} width={350} />
                          <Skeleton className={classNames.date} width={300} />
                        </div>
                        <div className={classNames.credit}>
                          <Skeleton className={classNames.value} width={80} />
                        </div>
                        <div className={classNames.debit}>
                          <Skeleton className={classNames.value} width={80} />
                        </div>
                        <div className={classNames.balance}>
                          <Skeleton className={classNames.value} width={80} />
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            ))
        : trackerData?.txns &&
          trackerData?.txns?.map((txn) => {
            function sameDay() {
              if (moment(txn.timestamp).format('MMDDYYYY') === date.current) {
                return <></>;
              } else {
                date.current = moment(txn.timestamp).format('MMDDYYYY');
                return (
                  <div className={classNames.day}>
                    {YesterdayToday(txn.timestamp)}
                  </div>
                );
              }
            }
            return (
              <Fragment key={txn._id}>
                {sameDay()}
                {trackerType == 'withdraw' ? (
                  <TrackerDetailsWithdraw {...txn} />
                ) : (
                  <TrackerDetails {...txn} />
                )}
              </Fragment>
            );
          })}
    </Scrollbars>
  );
}

export default TrackerTransactions;

const TrackerDetails = ({
  sell_amount,
  sell_to_deposit,
  current_step_data,
  banker,
  date,
  payment_method,
  _id,
  path_id,
}) => {
  const {
    trackerData,
    settrackerImageOpen,
    trackingImage,
    setTrackingImage,
    setTransactionDetailSelected,
    settransactionId,
    setTransactionDetailSteps,
    setTransactionDetail,
  } = useContext(VaultPageContext);

  const { setCoinType } = useCoinContextData();

  const { setTrackerSidebarMenu } = useContext(BankContext);
  const coinData = trackerData?.perCoin?.filter(
    (eachCoin) => eachCoin?.coin == sell_to_deposit
  );
  const bankerData = trackerData?.perBanker?.filter((eachBanker) =>
    eachBanker?.banker_tag?.toLowerCase()?.includes(banker?.toLowerCase())
  );
  return (
    <div className={classNames.trackerDetails}>
      <div className={classNames.eachSubDiv}>
        <img
          src={coinData?.length > 0 ? coinData[0]?.coin_logo : usFlag}
          alt="usFlag"
          className={classNames.roundedImg}
        />
        <div>
          <div className={classNames.heading}>
            Sending ${sell_amount?.toFixed(2)}{' '}
            {sell_to_deposit ? sell_to_deposit : ''}
          </div>
          <div className={classNames.date}>
            Initiated on {moment(date).format('MMMM Do YYYY, h:mm:ss A')} IST
          </div>
        </div>
      </div>
      <div className={classNames.eachSubDiv}>
        <img
          src={payment_method?.icon ? payment_method.icon : interacLogo}
          alt="interacLogo"
          className={classNames.squareImg}
        />
        <div>
          <div className={classNames.heading}>Via {payment_method?.name}</div>
          <div className={classNames.date}>
            Sending From {payment_method?.country}
          </div>
        </div>
      </div>
      <div className={classNames.eachSubDiv}>
        <img
          src={
            bankerData?.length > 0
              ? bankerData[0]?.banker_profilePic
              : interacLogo
          }
          alt="interacLogo"
          className={classNames.squareImg}
        />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={classNames.heading}>
            {bankerData?.length > 0 ? bankerData[0]?.banker_name : banker}
          </div>
          {/* <div className={classNames.date}>Canada</div> */}
        </div>
      </div>
      <div className={classNames.eachSubDiv}>
        <div>
          <div className={classNames.heading}>{current_step_data?.name}</div>
          <div className={classNames.date}>Current Step</div>
        </div>
      </div>
      <div
        className={classNames.hashBtn}
        onClick={() => {
          // console.log(_id, '_id_id_id');
          // setCoinType('');
          // if (trackingImage == _id) {
          //   setTrackingImage('');
          // }
          setTrackingImage(_id);
          settrackerImageOpen('images');
        }}
      >
        Images
      </div>
      <div
        className={classNames.clickableDiv}
        onClick={() => {
          // setTransactionDetail('');
          setCoinType('trackerdetailed');
          setTransactionDetailSelected(path_id);
          settransactionId(_id);
          setTrackerSidebarMenu(false);
        }}
      ></div>
    </div>
  );
};

const TrackerDetailsWithdraw = ({
  sell_coin,
  final_sell_amount,
  date,
  buy_coin,
  final_buy_amount,
  userWithdrawData,
  status,
}) => {
  const [openedWithdrawDiv, setOpenedWithdrawDiv] = useState(false);
  const { setCoinType } = useCoinContextData();

  return (
    <div
      className={`${classNames.trackerDetailsWithdraw} ${
        openedWithdrawDiv ? classNames.trackerDetailsWithdrawSelected : ''
      }`}
      onClick={() => {
        if (status == 'Initiated') {
          setOpenedWithdrawDiv((prev) => !prev);
        }
      }}
    >
      <div>
        <div className={classNames.eachSubDiv}>
          <img
            src={bitcoinIcon}
            alt="bitcoinIcon"
            className={classNames.roundedImg}
          />
          <div>
            <div className={classNames.heading}>
              Withdraw ${final_sell_amount?.toFixed(2)}{' '}
              {sell_coin ? sell_coin : ''}
            </div>
            <div className={classNames.date}>
              On {moment(date).format('MMMM Do YYYY, h:mm:ss A')} IST
            </div>
          </div>
        </div>
        <div className={classNames.eachSubDiv}>
          <div>
            <div className={classNames.heading}>
              Receiving ${final_buy_amount?.toFixed(2)}{' '}
              {buy_coin ? buy_coin : ''}
            </div>
            <div className={classNames.date}>
              On {moment(date).format('MMMM Do YYYY, h:mm:ss A')} IST
            </div>
          </div>
        </div>
        <div className={classNames.eachSubDiv}>
          <div>
            <div className={classNames.heading}>Destination Address</div>
            <div className={classNames.date}>
              {userWithdrawData ? userWithdrawData : ''}
            </div>
          </div>
        </div>
        <div className={classNames.eachSubDiv}>
          <div>
            <div className={classNames.heading}>Status</div>
            <div className={classNames.date}>{status ? status : ''}</div>
          </div>
        </div>
      </div>
      <div
        className={classNames.initialisedBtns}
        style={{ display: openedWithdrawDiv ? '' : 'none' }}
      >
        <div className={classNames.eachSubDiv}>
          <div>
            <div className={classNames.heading}>Hash</div>
            <div className={classNames.date}>Not Generated Yet</div>
          </div>
        </div>
        <div className={classNames.cancelBtn}>Cancel</div>
      </div>
    </div>
  );
};
