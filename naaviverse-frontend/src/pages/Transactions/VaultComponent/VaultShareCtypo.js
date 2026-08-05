import React, { useRef, useContext, useState, createRef } from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import { VaultPageContext } from '../../../context/VaultPageContext';
import moment from 'moment';
import { FormatCurrency, YesterdayToday } from '../../../utils/FunctionTools';
import credit from '../../../static/images/txnIcons/credit.svg';
import debit from '../../../static/images/txnIcons/debit.svg';
import chat from '../../../static/images/txnIcons/chat.svg';
import edit from '../../../static/images/txnIcons/edit.svg';
import txnHash from '../../../static/images/txnIcons/txnHash.svg';
import OnOutsideClick from '../../../utils/OnOutsideClick';
import TransactionExpand from './TransactionExpand';

function VaultShareCtypo({ txn }) {
  const { assetClass } = useContext(VaultPageContext);
  const [txnOpen, setTxnOpen] = useState(false);
  console.log('x43', txn);
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
        {/* <div className={classNames.buttons} ref={elRefs.current[0]}>
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
        </div> */}
        <div className={classNames.credit}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {/* withdraw */}
            {/* {FormatCurrency(
              txn?.deposit
                ? assetClass.name === 'fiat'
                  ? txn?.amt_credited
                  : txn.amount
                : 0,
              txn?.coin
            )} */}
            {txn?.deposit ? txn?.amount?.toFixed(7) : Number(0).toFixed(7)}
            {/* {FormatCurrency(txn?.amount, txn?.coin)} */}
          </span>
        </div>
        <div className={classNames.debit}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {txn?.withdraw ? txn?.amount?.toFixed(7) : Number(0).toFixed(7)}
            {/* {txn?.withdraw ? FormatCurrency(txn?.amount, txn?.coin) : 0} */}
            {/* {FormatCurrency(txn?.amount, txn?.coin)} */}
          </span>
        </div>
        <div className={classNames.balance}>
          <span className={classNames.expand}>Expand</span>
          <span className={classNames.value}>
            {FormatCurrency(txn?.updated_balance, txn?.coin)}
            {/* {txn?.updated_balance?.toFixed(7)} */}
          </span>
        </div>
      </div>
      {txnOpen && <TransactionExpand txn={txn} forwardedRef={elRefs} />}
    </div>
  );
}

export default VaultShareCtypo;
