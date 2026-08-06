import React, { useContext } from 'react';
import classNames from './vaultsPage.module.scss';
import Skeleton from 'react-loading-skeleton';
import { BankContext } from '../../../context/Context';
import { useUserDetails } from '../../../queryHooks';

function UserCard({ user, loading }) {
  const { coinListObject } = useContext(BankContext);
  const { data: userDetail, isLoading: userDeatailLoading } = useUserDetails(
    user?.email
  );
  return (
    <div className={classNames.userCard}>
      {userDeatailLoading || loading ? (
        <>
          <div className={classNames.user}>
            <Skeleton circle className={classNames.dp} />
            <div className={classNames.nameAppCode}>
              <Skeleton className={classNames.name} width={200} />
              <Skeleton className={classNames.appCode} width={160} />
            </div>
          </div>
          <Skeleton className={classNames.liquidity} width={150} />
          <div className={classNames.coin}>
            <Skeleton circle className={classNames.coinIcon} />
            <Skeleton className={classNames.appCode} width={160} />
          </div>
        </>
      ) : (
        <>
          <div className={classNames.user}>
            <img
              src={userDetail?.profile_img}
              alt=""
              className={classNames.dp}
            />
            <div className={classNames.nameAppCode}>
              <div className={classNames.name}>{userDetail?.name}</div>
              <div className={classNames.appCode}>{user?.app_code}</div>
            </div>
          </div>
          <div className={classNames.liquidity}>Liquid</div>
          <div className={classNames.coin}>
            <img
              src={coinListObject[user?.coin]?.coinImage}
              alt=""
              className={classNames.coinIcon}
            />
            <span>{user?.coin}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default UserCard;
