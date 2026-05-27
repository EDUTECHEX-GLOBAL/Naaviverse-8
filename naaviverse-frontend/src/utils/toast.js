import { toast } from 'react-toastify';

export function predefinedToast(toastmessage) {
  toast(toastmessage, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'colored',
  });
}

export function predefinedToastWhite(toastmessage) {
  toast(toastmessage, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "white",
  });
}
