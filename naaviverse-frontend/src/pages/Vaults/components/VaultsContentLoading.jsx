import React from 'react';

//scss
import classNames from './vaultscomponents.module.scss';
import Skeleton from 'react-loading-skeleton';

const VaultsContentLoading = () => {
  return (
    <div className={classNames.vaultsContent}>
      <div>
        <Skeleton circle width={35} height={35} />
        <span>
          <Skeleton width={120} height={25} />
        </span>
      </div>
      <div>
        <Skeleton width={120} height={25} />
      </div>
      <div>
        <Skeleton width={120} height={25} />
      </div>
      <div>
        <Skeleton height={45} width={120} />
        <Skeleton height={45} width={120} />
      </div>
    </div>
  );
};

export default VaultsContentLoading;
