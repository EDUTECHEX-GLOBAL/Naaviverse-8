import React, { useRef, useContext, Fragment } from 'react';
import classNames from './vaultsPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import { VaultPageContext } from '../../../context/VaultPageContext';
import Scrollbars from 'react-custom-scrollbars';
import moment from 'moment';
import { YesterdayToday } from './FunctionTools';
import VaultItemForexCrypto from './VaultItemForexCrypto';

function VaultTransactions({ loading }) {
  const { txnListFxCrypto: txnList, txnListLoadingFxCrypto: txnListLoading } =
    useContext(VaultPageContext);
  const date = useRef();
  return (
    <Scrollbars className={classNames.vaultsView}>
      {txnListLoading || loading
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
        : txnList?.map((txn) => {
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
                <VaultItemForexCrypto key={txn._id} txn={txn} />
              </Fragment>
            );
          })}
    </Scrollbars>
  );
}

export default VaultTransactions;
