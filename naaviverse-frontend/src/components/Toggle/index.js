import React, { useState, useEffect } from 'react';
import './toggle.scss';
import { useStore } from '../store/store.ts';

function Toggle({ toggle = false, setToggle = () => null, coinType }) {
  const { check, setCheck } = useStore();

  useEffect(() => {
    if (toggle == 'deposit') {
      setToggle('withdraw');
    } else if (toggle == 'withdraw') {
      setToggle('deposit');
    } else {
      setToggle(check);
    }
  }, [check]);

  return (
    <div className="togglecomp">
      <p>
        {toggle == 'deposit'
          ? 'Deposits'
          : toggle == 'withdraw'
          ? 'Withdraw'
          : coinType === 'tracker'
          ? 'Deposits'
          : check
          ? 'With Balances'
          : 'Without Balances'}
      </p>
      <div className="toggle-div">
        <input
          className="tgl1"
          type="checkbox"
          id="switch"
          onClick={(e) => setCheck(e.target.checked)}
          checked={check}
        />
        <label className="tgl2" htmlFor="switch" />
      </div>
    </div>
  );
}

export default Toggle;
