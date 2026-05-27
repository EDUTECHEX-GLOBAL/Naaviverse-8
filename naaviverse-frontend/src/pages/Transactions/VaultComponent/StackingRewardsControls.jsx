import React, { useState } from 'react';
import classNames from './vaultsPage.module.scss';

import downArrow from './downarrowdropdown.svg';
import { useStore } from '../../../components/store/store';

const StackingRewardsControls = () => {
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
        return <CustomDropdown dropdown={eachoption} key={'option' + i} />;
      })}
    </div>
  );
};

export default StackingRewardsControls;

const CustomDropdown = ({ dropdown }) => {
  const { coinType, setAllDirection, setAllTypes } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [masterSelected, setMasterSelected] = useState(dropdown[0]?.name);
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
          <img
            src={downArrow}
            alt="downArrow"
            style={{ rotate: dropdownOpen ? '0deg' : '' }}
          />
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
