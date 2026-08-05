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

export const TrackerContents = () => {
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
  } = useContext(VaultPageContext);

  return (
    <div
      className={classNames.contentArea}
      onClick={() => {
        if (assetDropdown && statusDropdown) {
          setassetDropdown(false);
          setstatusDropdown(false);
        } else if (assetDropdown) {
          setassetDropdown(false);
        } else if (statusDropdown) {
          setstatusDropdown(false);
        } else {
        }
      }}
    >
      <div style={{ fontSize: '1.75rem', marginBottom: '1.6rem' }}>
        Track Your External <span style={{ fontWeight: '700' }}>Deposits</span>{' '}
        and Withdrawals In Live Time
      </div>
      <TrackerControls
        appSelected={appSelected}
        setAppSelected={setAppSelected}
        email={email}
      />
      <TrackerTransactions email={email} loading={loading} />
      {trackerImageOpen && <Overlay />}
      {trackerImageOpen && <TrackerImageAdd />}
    </div>
  );
};
