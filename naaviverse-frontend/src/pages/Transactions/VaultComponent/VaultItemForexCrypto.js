import React, { useRef, useContext, useState, createRef } from 'react';
import classNames from './vaultsPage.module.scss';
import { VaultPageContext } from '../../../context/VaultPageContext';
import moment from 'moment';
import { FormatCurrency } from './FunctionTools';
import credit from './txnIcons/credit.svg';
import debit from './txnIcons/debit.svg';
import chat from './txnIcons/chat.svg';
import edit from './txnIcons/edit.svg';
import txnHash from './txnIcons/txnHash.svg';
import OnOutsideClick from './OnOutsideClick';
import TransactionExpand from './TransactionExpand';

function VaultItemForexCrypto({ txn }) {
  const { assetClass } = useContext(VaultPageContext);
  const [txnOpen, setTxnOpen] = useState(false);
// console.log("x43",txn)
  const elRefs = useRef([]);
  if (elRefs.current.length !== 3) {
    // add or remove refs
    elRefs.current = Array(3)
      .fill()
      .map((_, i) => elRefs.current[i] || createRef());
  }

  const refOut = useRef();
  OnOutsideClick(
    undefined,
    () => {
      setTxnOpen((txnOpen) => !txnOpen);
    },
    refOut,
    elRefs
  );

  return (
    <div
      className={`${classNames.vaultItmWrap} ${classNames[txnOpen]}`}
      ref={refOut}
    >
      <div className={classNames.vaultsItm}>
        <img
          src={txn?.withdraw ? credit : debit}
          alt=""
          className={classNames.img}
        />
        <div className={classNames.nameDate}>
          <div className={classNames.name}>{txn.pid || txn.reason}</div>
          <div className={classNames.date}>
            {moment(txn.timestamp).format('MMMM Do YYYY [at] h:mm:ss A zz')}
          </div>
        </div>
        <div className={classNames.buttons} ref={elRefs.current[0]}>
          <div className={classNames.btnNotes}>
            <span>Notes</span>
          </div>
          <div className={classNames.btnEdit}>
            <img src={edit} alt="" className={classNames.btnIcon} />
          </div>
          <div className={classNames.btnTxn}>
            <img src={txnHash} alt="" className={classNames.btnIcon} />
          </div>
          <div className={classNames.btnChat}>
            <img src={chat} alt="" className={classNames.btnIcon} />
          </div>
        </div>
        <div className={classNames.credit}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {FormatCurrency(
              txn?.deposit
                ? assetClass.name === 'fiat'
                  ? txn?.amt_credited
                  : txn.amount
                : 0,
              txn?.coin
            )}
          </span>
        </div>
        <div className={classNames.debit}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {FormatCurrency(
              txn?.withdraw
                ? assetClass.name === 'fiat'
                  ? txn?.amt_credited
                  : txn.amount
                : 0,
              txn?.coin
            )}
          </span>
        </div>
        <div className={classNames.balance}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {FormatCurrency(txn?.updated_balance, txn?.coin)}
          </span>
        </div>
      </div>
      {txnOpen && <TransactionExpand txn={txn} forwardedRef={elRefs} />}
    </div>
  );
}

export default VaultItemForexCrypto;
