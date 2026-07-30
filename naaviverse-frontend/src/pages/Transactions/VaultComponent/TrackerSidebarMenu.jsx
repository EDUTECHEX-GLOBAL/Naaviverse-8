import React, { useContext, useState } from 'react';
import '../../../static/scss/trackerDetailed.scss';
import copyIcon from '../../../static/images/copyIcon.svg';
import { BankContext } from '../../../context/Context';
import { VaultPageContext } from '../../../context/VaultPageContext';
import { useEffect } from 'react';
import axios from 'axios';

const TrackerSidebarMenu = () => {
  const { justCopyToClipboard, setTrackerSidebarMenu, bankAccountId } =
    useContext(BankContext);
  //   const { bankAccountId } = useContext(VaultPageContext);
  const [bankAccountIdValue, setBankAccountIdValue] = useState('');
  const [bankInfoValues, setbankInfoValues] = useState('');
  const [qrOpen, setQropen] = useState('');

  useEffect(() => {
    setbankInfoValues('');
    setBankAccountIdValue('');
    axios
      .get(
        `https://comms.globalxchange.io/coin/user/bank/account/get?bank_account_id=${bankAccountId}`
      )
      .then((response) => {
        if (response?.data?.bankAccounts_info?.length > 0) {
          setBankAccountIdValue(response?.data?.bankAccounts_info[0]);
          let res = response?.data?.bankAccounts_info;
          // console.log(response?.data?.bankAccounts_info[0], 'bankAccountId');
          const arr = Object.keys(res[0]?.bank_information).map((key) => {
            return { id: key, ...res[0]?.bank_information[key] };
          });
          // console.log(arr, 'bank acc value');
          setbankInfoValues(arr);
        }
      })
      .catch((error) => {
        console.log(error?.message, 'error from bankAccountId');
      });
  }, [bankAccountId]);

  return (
    <div className="trackerSidebar">
      <div className="trackerSidebarTop">
        <EachMenuItem
          title="Account Name"
          value={
            bankAccountIdValue?.account_name
              ? bankAccountIdValue?.account_name
              : ''
          }
        />
        <EachMenuItem
          title="Payment Method"
          value={
            bankAccountIdValue?.paymentMethod_data?.name
              ? bankAccountIdValue?.paymentMethod_data?.name
              : ''
          }
          img={
            bankAccountIdValue?.paymentMethod_data?.icon
              ? bankAccountIdValue?.paymentMethod_data?.icon
              : ''
          }
        />
        {bankInfoValues?.length > 0
          ? bankInfoValues?.map((eachItem) => {
              return eachItem?.valuetype == 'image' ? (
                <div className="qrDiv">
                  <div>
                    <div className="title">
                      {eachItem?.name ? eachItem.name : ''}
                    </div>
                    <div className="option" onClick={() => setQropen(!qrOpen)}>
                      {qrOpen ? 'Collapse' : 'Expand'}
                    </div>
                  </div>
                  <div style={{ padding: qrOpen ? '0px' : '' }}>
                    <img
                      src={
                        eachItem?.value && eachItem?.value?.includes('https:')
                          ? eachItem.value
                          : ''
                      }
                      alt="qrimg"
                    />
                  </div>
                </div>
              ) : (
                <EachMenuItem
                  title={eachItem?.name ? eachItem.name : ''}
                  value={eachItem?.value ? eachItem.value : ''}
                  type={eachItem?.valuetype ? eachItem.valuetype : ''}
                />
              );
            })
          : ''}
      </div>
      <div className="btnDiv" onClick={() => setTrackerSidebarMenu(false)}>
        Close
      </div>
    </div>
  );
};

export default TrackerSidebarMenu;

const EachMenuItem = ({ title, value, img }) => {
  const { justCopyToClipboard } = useContext(BankContext);
  return (
    <div className="eachMenuItem">
      <div className="title">{title}</div>
      <div className="valueField">
        <div>
          {img ? <img src={img} alt="coin" /> : ''}
          <span>{value ? value : ''}</span>
        </div>
        <img
          src={copyIcon}
          alt="copyIcon"
          onClick={() => justCopyToClipboard(value)}
        />
      </div>
    </div>
  );
};
