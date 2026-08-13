import React, { useState, useEffect } from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import searchIcon from '../../../static/images/search.svg';
import carretDown from '../../../static/images/icons/carretDown.svg';
import SelectAppModal from '../../SelectAppModal';
import { useShareTokensVaultsList } from '../../../queryHooks';

function VaultControlShares({ email, appSelected, setAppSelected }) {
  const [appModal, setAppModal] = useState(false);
  const { data } = useShareTokensVaultsList(email);
  useEffect(() => {
    if (data?.appsData) {
      setAppSelected(Object.values(data?.appsData)[0]);
    }
  }, [data?.appsData]);

  return (
    <>
      <div className={classNames.vaultFilter}>
        <div
          className={classNames.appSelectWrap}
          onClick={() => setAppModal(true)}
        >
          {appSelected ? (
            <div className={classNames.appSelected}>
              <img
                src={appSelected?.app_icon}
                alt=""
                className={classNames.icon}
              />
              <span className={classNames.appName}>
                {appSelected?.app_name}
              </span>
              <img src={carretDown} alt="" className={classNames.caret} />
            </div>
          ) : (
            <div className={classNames.appSelected}>
              <Skeleton className={classNames.icon} circle />
              <Skeleton width={150} className={classNames.appName} />
            </div>
          )}
        </div>
        <div className={classNames.allTxnWrap}>
          <div className={classNames.txnSelected}>
            <span className={classNames.label}>All Transactions</span>
            <img src={carretDown} alt="" className={classNames.caret} />
          </div>
        </div>
        <div className={classNames.allDirectionWrap}>
          <div className={classNames.dirSelected}>
            <span className={classNames.label}>All Directions</span>
            <img src={carretDown} alt="" className={classNames.caret} />
          </div>
        </div>
        <div className={classNames.searchWrap}>
          <div className={classNames.searchHead}>
            <input
              type="text"
              name="search"
              className={classNames.searcInp}
              placeholder="Search Transactions"
            />
            <img src={searchIcon} alt="" className={classNames.searchIcon} />
          </div>
        </div>
      </div>
      {appModal && (
        <SelectAppModal
          filter={data?.appsData && Object.keys(data?.appsData)}
          onClose={() => setAppModal(false)}
          onSuccess={() => setAppModal(false)}
          appSelected={appSelected}
          setAppSelected={setAppSelected}
          email={email}
        />
      )}
    </>
  );
}

export default VaultControlShares;
