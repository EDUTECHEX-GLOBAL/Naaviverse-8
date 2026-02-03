import React, { useEffect, useState } from 'react';
import classNames from './pagination.module.scss';

const Pagination = ({
  pagination,
  setPagination,
  txns,
  setTxns,
  disabledd,
}) => {
  const [paginationMap, setPaginationMap] = useState([]);

  useEffect(() => {
    setPaginationMap(getNextFive(pagination));
  }, [pagination]);

  function getNextFive(start_num) {
    let next_five = [];
    for (let i = 0; i <= 4; i++) {
      let next_num = start_num + i;
      next_five.push(next_num);
    }
    // console.log(next_five, 'next_five');
    return next_five;
  }

  return (
    <div
      className={classNames.paginationComponent}
      style={{
        opacity: disabledd ? '0.5' : '',
        pointerEvents: disabledd ? 'none' : '',
      }}
    >
      <div className={classNames.perPage}>
        <div>Txn’s Per Page</div>
        <div
          style={{ opacity: txns == 25 ? '' : '0.5' }}
          onClick={() => setTxns(25)}
        >
          25
        </div>
        <div
          style={{ opacity: txns == 50 ? '' : '0.5' }}
          onClick={() => setTxns(50)}
        >
          50
        </div>
        <div
          style={{ opacity: txns == 100 ? '' : '0.5' }}
          onClick={() => setTxns(100)}
        >
          100
        </div>
      </div>
      <div className={classNames.nextPrevPage}>
        <div
          onClick={() => {
            if (pagination !== 0) {
              setPagination(pagination - 1);
            }
          }}
        >
          {`<`}&nbsp;Prev
        </div>
        {paginationMap?.length > 0 &&
          paginationMap.map((eachItem, i) => {
            return (
              <div
                key={eachItem + i}
                onClick={() => {
                  setPagination(eachItem);
                }}
                style={{
                  // opacity: pagination == eachItem ? '' : '0.7',

                  background: pagination == eachItem ? '#dee8f3' : '',
                  border: pagination == eachItem ? '0.5px solid #F8F9FA' : '',
                }}
              >
                {eachItem + 1}
              </div>
            );
          })}
        <div onClick={() => setPagination(pagination + 1)}>
          Next &nbsp;{`>`}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
