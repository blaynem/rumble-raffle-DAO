import React from 'react';
import { XIcon, CheckCircleIcon, ExclamationIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/outline'
import {ToastTypes} from '@rumble-raffle-dao/types/web';

/**
 * NOTE: TailwindCSS will tree shake any of these background classes that are not explicitly set
 * In order to stop that, inside of tailwind.config.js we have whitelisted some colors.
 */

const ToastMessage = ({ type, message, onClick }: ToastTypes) => {
  let colors = {
    main: 'blue-600',
    secondary: 'blue-500'
  };
  let icon = <InformationCircleIcon className="block h-6 w-6" aria-hidden="true" />
  let note = "Info"
  if (type === 'ERROR') {
    colors = {
      main: 'red-600',
      secondary: 'red-500'
    }
    icon = <XCircleIcon className="block h-6 w-6" aria-hidden="true" />
    note = "Error"
  } else if (type === 'WARNING') {
    colors = {
      main: 'green-500',
      secondary: 'green-400'
    }
    icon = <ExclamationIcon className="block h-6 w-6" aria-hidden="true" />
    note = "Warning"
  } else if (type === 'SUCCESS') {
    colors = {
      main: 'green-500',
      secondary: 'green-400'
    }
    icon = <CheckCircleIcon className="block h-6 w-6" aria-hidden="true" />
    note = "Success"
  }
  return (
    <div className="flex flex-col justify-center">
      <div className={`bg-${colors.main} shadow-lg mx-auto w-96 max-w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block mb-3`} id="static-example" role="alert" aria-live="assertive" aria-atomic="true" data-mdb-autohide="false">
        <div className={`bg-${colors.main} flex justify-between items-center py-2 px-3 bg-clip-padding border-b border-${colors.secondary} rounded-t-lg`}>
          <p className="font-bold text-white flex items-center">{icon}&nbsp;{note}</p>
          <div className="flex items-center">
            <button onClick={onClick} type="button" className="btn-close btn-close-white box-content w-4 h-4 ml-2 text-white border-none rounded-none opacity-50 focus:shadow-none focus:outline-none focus:opacity-100 hover:text-white hover:opacity-75 hover:no-underline" data-mdb-dismiss="toast" aria-label="Close"><XIcon className="block h-6 w-6" aria-hidden="true" /></button>
          </div>
        </div>
        <div className={`p-3 bg-${colors.main} rounded-b-lg break-words text-white`}>
          {message}
        </div>
      </div>
    </div>
  )
}

export default ToastMessage;