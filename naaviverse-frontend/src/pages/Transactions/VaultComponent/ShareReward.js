import React, { useContext, useState } from 'react';
import classNames from '../../../pages/VaultsPage/vaultsPage.module.scss';

// import downArrow from '../../../static/images/icons/downarrowdropdown.svg';
import { useCoinContextData } from '../../../context/CoinContext';
import { VaultPageContext } from '../../../context/VaultPageContext';

const ShareReward = ({
  passvaulterFiler,
  getLink,
  passvaulterFilerWithdraw,
  passTypeTransaction,
}) => {
  const alldirection = [
    { name: 'All Directions', field: 'All Directions' },
    { name: 'Deposit', field: 'deposit' },
    { name: 'Withdrawals', field: 'withdraw' },
  ];
  const alltypes = [
    { name: 'All Types', field: 'All Types' },
    { name: 'Internal', field: 'internal' },
    { name: 'External', field: 'external' },
  ];
  const options = [alldirection, alltypes];
  return (
    <div
      className={classNames.stakingControls}
      // style={{ opacity: '0.5', pointerEvents: 'none' }}
    >
      {options?.map((eachoption, i) => {
        return (
          <CustomDropdown
            dropdown={eachoption}
            passvaulterFiler={passvaulterFiler}
            getLink={getLink}
            passvaulterFilerWithdraw={passvaulterFilerWithdraw}
            passTypeTransaction={passTypeTransaction}
            key={'option' + i}
          />
        );
      })}
    </div>
  );
};

export default ShareReward;

const CustomDropdown = ({
  dropdown,
  passvaulterFiler,
  getLink,
  passTypeTransaction,
  passvaulterFilerWithdraw,
}) => {
  const { coinType } = useCoinContextData();
  const { setAllDirection, setAllTypes } = useContext(VaultPageContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [masterSelected, setMasterSelected] = useState(dropdown[0]?.name);

  const callFunctiondrop = (e) => {
    if (e == 'All Directions' || e === 'All Types') {
      getLink();
    } else if (e == 'Deposit') {
      passvaulterFiler();
    } else if (e == 'Withdrawals') {
      passvaulterFilerWithdraw();
    } else if (e == 'Internal') {
      passTypeTransaction('internal');
    } else if (e == 'External') {
      passTypeTransaction('external');
    }
  };
  return (
    <div
      className={classNames.customDropdown}
      style={{
        pointerEvents: coinType == 'crypto' || coinType == 'fiat' ? '' : 'none',
        opacity: coinType == 'crypto' || coinType == 'fiat' ? '' : '0.5',
      }}
    >
      <div
        className={classNames.selectedDropdown}
        style={{ borderRadius: dropdownOpen ? '15px 15px 0 0' : '' }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>{masterSelected}</span>
        <span>
          {/* <img
            src={downArrow}
            alt="downArrow"
            style={{ rotate: dropdownOpen ? '0deg' : '' }}
          /> */}
        </span>
      </div>
      {dropdownOpen && (
        <div className={classNames.dropdown}>
          {dropdown?.map((eachitem, i) => {
            return masterSelected == eachitem ? (
              ''
            ) : (
              <div
                key={'eachitem' + i}
                onClick={() => {
                  setMasterSelected(eachitem?.name);
                  callFunctiondrop(eachitem?.name);
                  setDropdownOpen(!dropdownOpen);
                  if (
                    eachitem?.name == 'All Directions' ||
                    eachitem?.name == 'Deposit' ||
                    eachitem?.name == 'Withdrawals'
                  ) {
                    setAllDirection(eachitem?.field);
                  } else if (
                    eachitem?.name == 'All Types' ||
                    eachitem?.name == 'Internal' ||
                    eachitem?.name == 'External'
                  ) {
                    setAllTypes(eachitem?.field);
                  }
                }}
                style={{
                  padding:
                    eachitem?.name == 'All Directions'
                      ? '1.6rem 1.5rem 0.8rem'
                      : eachitem?.name == 'All Types'
                      ? '1.6rem 1.5rem 0.8rem'
                      : '0.8rem 1.5rem',
                }}
              >
                {eachitem?.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
