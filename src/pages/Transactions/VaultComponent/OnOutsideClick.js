import { useEffect } from 'react';

function OnOutsideClick(ref, callBack, refOut, refArr) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (refOut?.current) {
        if (refArr?.current?.length) {
          let out = 0;
          refArr.current.forEach((ref, i) => {
            if (
              !ref?.current?.contains(event.target) &&
              (refOut?.current?.contains(event.target) ||
                refOut?.current === event.target)
            ) {
              out++;
            }
          });
          if (out === refArr?.current?.length) {
            callBack();
          }
        } else if (
          !ref?.current?.contains(event.target) &&
          (refOut?.current?.contains(event.target) ||
            refOut?.current === event.target)
        ) {
          callBack();
        }
      } else if (ref?.current && !ref.current.contains(event.target)) {
        callBack();
      }
    }

    // Bind the event listener
    document.addEventListener('click', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('click', handleClickOutside);
    };
    // eslint-disable-next-line
  }, [ref]);
}

export default OnOutsideClick;
