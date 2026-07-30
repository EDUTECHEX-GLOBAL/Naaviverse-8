import React, { useContext } from 'react';
import { VaultPageContext } from '../../../../context/VaultPageContext';

const Overlay = () => {
  const { trackerImageOpen, settrackerImageOpen } =
    useContext(VaultPageContext);
  return (
    <div
      style={{ position: 'fixed', inset: '0' }}
      onClick={() => settrackerImageOpen('')}
    ></div>
  );
};

export default Overlay;
