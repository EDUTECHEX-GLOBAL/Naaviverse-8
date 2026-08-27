import React, { useContext } from 'react';
import { VaultPageContext } from '../../../context/VaultPageContext';
import { BankContext } from '../../../context/Context';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import TrackerTransactions from './TrackerTransactions';
import TrackerControls from './TrackerControls';

export const TrackerContentsWithdraw = () => {
  const { email } = useContext(BankContext);

  const {
    appSelected,
    setAppSelected,
    vaultsListFxCrypto: vaultsList,
    vaultsListFxCryptoLoading: loading,
    setassetDropdown,
    setstatusDropdown,
    assetDropdown,
    statusDropdown,
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
        Track Your External Deposits and
        <span style={{ fontWeight: '700' }}> Withdrawals</span> In Live Time
      </div>
      <TrackerControls
        appSelected={appSelected}
        setAppSelected={setAppSelected}
        email={email}
      />
      <TrackerTransactions email={email} loading={loading} />
    </div>
  );
};
