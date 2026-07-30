import React, { useContext } from 'react';
import VaultHeaderCryproForex from './VaultHeaderCryproForex';
import VaultTransactions from './VaultTransactions';
import { VaultPageContext } from '../../../context/VaultPageContext';
import classNames from './vaultsPage.module.scss';
import StackingRewardsControls from './StackingRewardsControls';
import Pagination from '../../../components/Pagination/Pagination';

export const VaultContents = () => {
  const userDetails = JSON.parse(localStorage.getItem("user"));
  const email = userDetails?.user?.email;

  const {
    assetClass,
    appSelected,
    setAppSelected,
    vaultSelected,
    setVaultSelected,
    vaultsListFxCrypto: vaultsList,
    vaultsListFxCryptoLoading: loading,
    bondsPagination,
    setBondsPagination,
    bondsTxnsPerPage,
    setBondsTxnsPerPage,
  } = useContext(VaultPageContext);

  switch (assetClass?.name) {
    case 'moneyMarkets':
      return (
        <div className={classNames.contentArea}>
        </div>
      );
    case 'bonds':
      return (
        <div className={classNames.contentArea}>
        </div>
      );
    case 'shares':
      return (
        <div className={classNames.contentArea}>
        </div>
      );
    default:
      return (
        <div className={classNames.contentArea}>
          <VaultHeaderCryproForex
            appSelected={appSelected}
            setAppSelected={setAppSelected}
            assetClass={assetClass}
            email={email}
            vaultSelected={vaultSelected}
            setVaultSelected={setVaultSelected}
            vaultsList={vaultsList}
            loading={loading}
          />
          {/* <VaultControls
            appSelected={appSelected}
            setAppSelected={setAppSelected}
            email={email}
          /> */}
          <StackingRewardsControls />
          <VaultTransactions email={email} loading={loading} />
          <Pagination
            pagination={bondsPagination}
            setPagination={setBondsPagination}
            txns={bondsTxnsPerPage}
            setTxns={setBondsTxnsPerPage}
            disabledd="true"
          />
        </div>
      );
  }
};
