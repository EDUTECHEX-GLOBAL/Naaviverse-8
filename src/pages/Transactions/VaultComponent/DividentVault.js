import React, { useContext } from 'react';
import VaultHeaderCryproForex from './VaultHeaderCryproForex';
import VaultHeaderBonds from './VaultHeaderBonds';
import VaultHeaderMoneyMarkets from './VaultHeaderMoneyMarkets';
import VaultHeaderShares from './VaultHeaderShares';
import VaultControls from './VaultControls';
import VaultControlBonds from './VaultControlBonds';
import VaultControlShares from './VaultControlShares';
import VaultTransactions from './VaultTransactions';
import VaultTransactionsBonds from './VaultTransactionsBonds';
import VaultTransactionsMoneyMarkets from './VaultTransactionsMoneyMarkets';
import VaultTransactionsShares from './VaultTransactionsShare';
import { VaultPageContext } from '../../../context/VaultPageContext';
import { BankContext } from '../../../context/Context';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import StackingRewardsControls from './DividentRewards';
import Pagination from '../../Pagination/Pagination';
import ShareVaultHeader from './DividentHeader';
export const DividentVault = ({
  shareTokenTranscation,
  SLoading,
  //   passvaulterFiler,
  //   passTypeTransaction,
  //   getLink,
  //   passvaulterFilerWithdraw,
}) => {
  console.log('akam', shareTokenTranscation);
  const { email } = useContext(BankContext);

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
          <VaultHeaderMoneyMarkets
            email={email}
            vaultSelected={vaultSelected}
            setVaultSelected={setVaultSelected}
            loading={loading}
          />
          {/* <VaultControls
            appSelected={appSelected}
            setAppSelected={setAppSelected}
            email={email}
          /> */}
          {/* <StackingRewardsControls passvaulterFiler={passvaulterFiler} /> */}
          <VaultTransactionsMoneyMarkets email={email} />
          <Pagination
            pagination={bondsPagination}
            setPagination={setBondsPagination}
            txns={bondsTxnsPerPage}
            setTxns={setBondsTxnsPerPage}
            disabledd="true"
          />
        </div>
      );
    case 'bonds':
      return (
        <div className={classNames.contentArea}>
          <VaultHeaderBonds
            email={email}
            vaultSelected={vaultSelected}
            setVaultSelected={setVaultSelected}
            loading={loading}
          />
          {/* <VaultControlBonds
            appSelected={appSelected}
            setAppSelected={setAppSelected}
            email={email}
          /> */}
          {/* <StackingRewardsControls passvaulterFiler={passvaulterFiler} /> */}
          <VaultTransactionsShares
            email={email}
            loading={loading}
            shareTokenTranscation={shareTokenTranscation}
            SLoading={SLoading}
          />
          <Pagination
            pagination={bondsPagination}
            setPagination={setBondsPagination}
            txns={bondsTxnsPerPage}
            setTxns={setBondsTxnsPerPage}
          />
        </div>
      );
    case 'shares':
      return (
        <div className={classNames.contentArea}>
          <VaultHeaderShares
            email={email}
            vaultSelected={vaultSelected}
            setVaultSelected={setVaultSelected}
            loading={loading}
          />
          {/* <VaultControlShares
            email={email}
            appSelected={appSelected}
            setAppSelected={setAppSelected}
          /> */}
          {/* <StackingRewardsControls passvaulterFiler={passvaulterFiler} /> */}
          <VaultTransactionsShares
            email={email}
            loading={loading}
            shareTokenTranscation={shareTokenTranscation}
            SLoading={SLoading}
          />
          <Pagination
            pagination={bondsPagination}
            setPagination={setBondsPagination}
            txns={bondsTxnsPerPage}
            setTxns={setBondsTxnsPerPage}
            disabledd="true"
          />
        </div>
      );
    default:
      return (
        <div className={classNames.contentArea}>
          <ShareVaultHeader
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
          <StackingRewardsControls
        //   Divident={Divident}
            // getLink={getLink}
            // passvaulterFilerWithdraw={passvaulterFilerWithdraw}
            // passvaulterFiler={passvaulterFiler}
            // passTypeTransaction={passTypeTransaction}
          />
          <VaultTransactionsShares
            loading={loading}
            shareTokenTranscation={shareTokenTranscation}
            SLoading={SLoading}
          />
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
