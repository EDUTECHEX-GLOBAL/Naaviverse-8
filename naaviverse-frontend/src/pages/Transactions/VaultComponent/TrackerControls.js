import React, { useContext, useState } from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import searchIcon from '../../../static/images/search.svg';
import carretDown from '../../../static/images/icons/carretDown.svg';
import SelectAppModal from '../../SelectAppModal';
import { VaultPageContext } from '../../../context/VaultPageContext';
import { useCoinContextData } from '../../../context/CoinContext';

function TrackerControls({ appSelected, setAppSelected, email }) {
  const [appModal, setAppModal] = useState(false);
  const { trackerType } = useCoinContextData();
  const {
    assetDropdown,
    setassetDropdown,
    statusDropdown,
    setstatusDropdown,
    assetDropdownItems,
    setassetDropdownItems,
    assetDropdownSelected,
    setassetDropdownSelected,
    statusDropdownSelected,
    setstatusDropdownSelected,
  } = useContext(VaultPageContext);
  return (
    <>
      <div className={classNames.vaultFilter}>
        <div className={classNames.allTxnWrap}>
          <div
            className={classNames.txnSelected}
            onClick={() => {
              if (assetDropdownItems?.perCoin) {
                setassetDropdown(!assetDropdown);
              }
            }}
            style={{ borderRadius: assetDropdown ? '8px 8px 0 0' : '' }}
          >
            <span className={classNames.label}>
              {assetDropdown
                ? 'All Assets'
                : assetDropdownSelected
                ? assetDropdownSelected
                : 'All Assets'}
            </span>
            <img
              src={carretDown}
              alt=""
              className={classNames.caret}
              style={{ rotate: assetDropdown ? '180deg' : '' }}
            />
          </div>
          <div
            className={classNames.dropDown}
            style={{ display: assetDropdown ? '' : 'none' }}
          >
            {assetDropdownItems?.perCoin?.length > 0 && (
              <div
                onClick={() => {
                  if (assetDropdownSelected == 'All Statuses') {
                    setassetDropdownSelected('');
                  } else {
                    setassetDropdownSelected(assetDropdownSelected);
                  }
                }}
                style={{ justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    fontWeight: '800',
                  }}
                >
                  {assetDropdownSelected ? assetDropdownSelected : 'All Assets'}
                </div>
                <img
                  src={carretDown}
                  alt=""
                  className={classNames.caret}
                  style={{
                    rotate: assetDropdown ? '180deg' : '',
                    height: '8px',
                  }}
                />
              </div>
              // <DropDownItem coin={assetDropdownSelected} arrow="down" />
            )}
            {assetDropdownItems?.perCoin?.length > 0 &&
              [{ coin: 'All Assets' }, ...assetDropdownItems?.perCoin]?.map(
                (eachItem) => {
                  return <DropDownItem {...eachItem} />;
                }
              )}
          </div>
        </div>
        <div
          className={classNames.allDirectionWrap}
          style={{ display: trackerType == 'withdraw' ? 'none' : '' }}
        >
          <div
            className={classNames.dirSelected}
            onClick={() => {
              if (assetDropdownItems?.perStatus) {
                setstatusDropdown(!statusDropdown);
              }
            }}
            style={{ borderRadius: statusDropdown ? '8px 8px 0 0' : '' }}
          >
            <span className={classNames.label}>
              {statusDropdown
                ? 'All Statuses'
                : statusDropdownSelected
                ? statusDropdownSelected
                : 'All Statuses'}
            </span>
            <img
              src={carretDown}
              alt=""
              className={classNames.caret}
              style={{ rotate: statusDropdown ? '180deg' : '' }}
            />
          </div>
          <div
            className={classNames.dropDown}
            style={{ display: statusDropdown ? '' : 'none' }}
          >
            {assetDropdownItems?.perStatus?.length > 0 && (
              <div
                onClick={() => {
                  if (statusDropdownSelected == 'All Statuses') {
                    setstatusDropdownSelected('');
                  } else {
                    setstatusDropdownSelected(statusDropdownSelected);
                  }
                }}
                style={{ justifyContent: 'space-between' }}
              >
                <div
                  style={{
                    fontWeight: '800',
                  }}
                >
                  {statusDropdownSelected
                    ? statusDropdownSelected
                    : 'All Statuses'}
                </div>
                <img
                  src={carretDown}
                  alt=""
                  className={classNames.caret}
                  style={{
                    rotate: statusDropdown ? '180deg' : '',
                    height: '8px',
                  }}
                />
              </div>
            )}
            {assetDropdownItems?.perStatus?.length > 0 &&
              [{ name: 'All Statuses' }, ...assetDropdownItems?.perStatus]?.map(
                (eachItem) => {
                  return <DropDownItemName {...eachItem} />;
                }
              )}
          </div>
        </div>
      </div>
      {appModal && (
        <SelectAppModal
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

export default TrackerControls;

const DropDownItem = ({ coin, coin_logo, arrow }) => {
  const { assetDropdown, assetDropdownSelected, setassetDropdownSelected } =
    useContext(VaultPageContext);
  return (
    <div
      onClick={() => {
        if (coin == 'All Assets') {
          setassetDropdownSelected('');
        } else {
          setassetDropdownSelected(coin);
        }
      }}
      style={{
        display:
          assetDropdownSelected === coin ||
          (assetDropdownSelected == '' && coin == 'All Assets')
            ? 'none'
            : '',
      }}
    >
      {coin !== 'All Assets' && <img src={coin_logo} alt="coin_logo" />}
      <div style={{ fontWeight: assetDropdownSelected == coin ? '800' : '' }}>
        {coin}
      </div>
    </div>
  );
};
const DropDownItemName = ({ name, arrow }) => {
  const { statusDropdown, statusDropdownSelected, setstatusDropdownSelected } =
    useContext(VaultPageContext);
  return (
    <div
      onClick={() => {
        if (name == 'All Statuses') {
          setstatusDropdownSelected('');
        } else {
          setstatusDropdownSelected(name);
        }
      }}
      style={{
        display:
          statusDropdownSelected === name ||
          (statusDropdownSelected == '' && name == 'All Statuses')
            ? 'none'
            : '',
      }}
    >
      <div style={{ fontWeight: statusDropdownSelected == name ? '800' : '' }}>
        {name}
      </div>
      {arrow ? (
        <img
          src={carretDown}
          alt=""
          className={classNames.caret}
          style={{ rotate: statusDropdown ? '180deg' : '' }}
        />
      ) : (
        ''
      )}
    </div>
  );
};
