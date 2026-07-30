import React, { useContext, useState } from 'react';
import UserCard from './UserCard';
import classNames from './vaultsPage.module.scss';
import { BankContext } from '../../../context/Context';
import { VaultPageContext } from '../../../context/VaultPageContext';
import Skeleton from 'react-loading-skeleton';
import { FormatCurrency } from './FunctionTools';
import connect from './txnIcons/connect.svg';
import tokenSwap from './txnIcons/tokenSwap.svg';
import indIcon from './txnIcons/ind.svg';
import { useVaultTxnDetails } from './queryHooks';

function TransactionExpand({ txn, forwardedRef }) {
  const { vaultSelected } = useContext(VaultPageContext);
  const { email } = useContext(BankContext);
  const [isLiveRate, setIsLiveRate] = useState(true);
  const { data: txnDetails, isLoading: txnDetailLoading } = useVaultTxnDetails(
    txn?.identifier,
    email,
    txn.deposit
  );
  const appCurrencyName = 'USD';

  return (
    <div className={classNames.vaultsExpand}>
      <hr />
      <div className={classNames.viewInAnother}>
        <div className={classNames.viewCurrency}>
          <span className={classNames.view}>View In Another Currency</span>
          <div className={classNames.btnCoin} ref={forwardedRef.current[1]}>
            <img src={indIcon} alt="" className={classNames.btnIcon} />
            <span>{appCurrencyName}</span>
          </div>
          <div className={classNames.rateLiveHistorical}>
            <span className={classNames[isLiveRate]}>Live Rate</span>
            <div
              className={classNames.btnOutline}
              ref={forwardedRef.current[2]}
              style={{ opacity: 0.5 }}
              // onClick={() => setIsLiveRate(!isLiveRate)}
            >
              <div
                className={`${classNames.btnBall} ${classNames[!isLiveRate]}`}
              />
            </div>
            <span className={classNames[!isLiveRate]}>Historical Rate</span>
          </div>
        </div>
        <div className={classNames.credit}>
          <span className={classNames.value}>
            &#x20b9;
            {FormatCurrency(
              txn?.deposit
                ? txn?.amount * vaultSelected?.price?.[appCurrencyName]
                : 0,
              appCurrencyName
            )}
          </span>
        </div>
        <div className={classNames.debit}>
          <span className={classNames.value}>
            &#x20b9; {/* Rupee Sign */}
            {FormatCurrency(
              txn?.withdraw
                ? txn?.amount * vaultSelected?.price?.[appCurrencyName]
                : 0,
              appCurrencyName
            )}
          </span>
        </div>
        <div className={classNames.balance}>
          <span className={classNames.value}>
            &#x20b9;
            {FormatCurrency(
              txn?.updated_balance * vaultSelected?.price?.[appCurrencyName],
              appCurrencyName
            )}
          </span>
        </div>
      </div>
      <hr />
      {txnDetailLoading ? (
        <div className={classNames.txnType}>
          <Skeleton width={240} className={classNames.text} />
          <Skeleton width={240} className={classNames.txnIcon} />
        </div>
      ) : (
        <div className={classNames.txnType}>
          <div className={classNames.text}>Transaction Type</div>
          <img
            src={txnDetails?.type === 'gx_transfer' ? connect : tokenSwap}
            alt=""
            className={classNames.txnIcon}
          />
        </div>
      )}
      <hr />
      <div className={classNames.from}>
        <div className={classNames.textFromTo}>From</div>
        <div className={classNames.txnFromTo}>
          <UserCard user={txnDetails?.fromUser} loading={txnDetailLoading} />
          <div className={classNames.credit}>
            <span className={classNames.value}>
              {FormatCurrency(
                txn?.withdraw ? 0 : txnDetails?.from_txn_data?.amount,
                txnDetails?.from_txn_data?.coin
              )}
            </span>
          </div>
          <div className={classNames.debit}>
            <span className={classNames.value}>
              {FormatCurrency(
                txn?.deposit ? 0 : txnDetails?.from_txn_data?.amount,
                txnDetails?.from_txn_data?.coin
              )}
            </span>
          </div>
          <div className={classNames.balance}>
            <span className={classNames.value}>
              {txn?.withdraw
                ? FormatCurrency(
                    txnDetails?.from_txn_data?.updated_balance,
                    txnDetails?.from_txn_data?.coin
                  )
                : ''}
            </span>
          </div>
        </div>
      </div>
      <div className={classNames.to}>
        <div className={classNames.textFromTo}>To</div>
        <div className={classNames.txnFromTo}>
          <UserCard user={txnDetails?.toUser} loading={txnDetailLoading} />
          <div className={classNames.credit}>
            <span className={classNames.value}>
              {FormatCurrency(
                txn?.deposit ? 0 : txnDetails?.to_txn_data?.amount,
                txnDetails?.to_txn_data?.coin
              )}
            </span>
          </div>
          <div className={classNames.debit}>
            <span className={classNames.value}>
              {FormatCurrency(
                txn?.withdraw ? 0 : txnDetails?.to_txn_data?.amount,
                txnDetails?.to_txn_data?.coin
              )}
            </span>
          </div>
          <div className={classNames.balance}>
            <span className={classNames.value}>
              {txn?.deposit
                ? FormatCurrency(
                    txnDetails?.to_txn_data?.updated_balance,
                    txnDetails?.to_txn_data?.coin
                  )
                : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionExpand;
