import React from 'react'
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ToastTypes } from '@rumble-raffle-dao/types'

/**
 * NOTE: TailwindCSS will tree shake any of these background classes that are not explicitly set
 * In order to stop that, inside of tailwind.config.js we have whitelisted some colors
 */

const ToastMessage = ({ type, message, onClick }: ToastTypes) => {
  let colors = {
    main: 'blue-600',
    secondary: 'blue-500'
  }
  let icon = <InformationCircleIcon className="block h-6 w-6" aria-hidden="true" />
  let note = 'Info'
  if (type === 'ERROR') {
    colors = {
      main: 'red-600',
      secondary: 'red-500'
    }
    icon = <XCircleIcon className="block h-6 w-6" aria-hidden="true" />
    note = 'Error'
  } else if (type === 'WARNING') {
    colors = {
      main: 'yellow-500',
      secondary: 'yellow-400'
    }
    icon = <ExclamationCircleIcon className="block h-6 w-6" aria-hidden="true" />
    note = 'Warning'
  } else if (type === 'SUCCESS') {
    colors = {
      main: 'green-500',
      secondary: 'green-400'
    }
    icon = <CheckCircleIcon className="block h-6 w-6" aria-hidden="true" />
    note = 'Success'
  }
  return (
    <div className="flex flex-col justify-center">
      <div
        className={`bg-${colors.main} shadow-lg mx-auto w-96 max-w-full text-base pointer-events-auto bg-clip-padding block mb-3`}
        id="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-mdb-autohide="false"
      >
        <div
          className={`bg-${colors.main} flex justify-between items-center py-2 px-3 bg-clip-padding border-b border-${colors.secondary}`}
        >
          <p className="font-bold text-white flex items-center">
            {icon}&nbsp;{note}
          </p>
          <div className="flex items-center">
            <button
              onClick={onClick}
              type="button"
              className="btn-close btn-close-white box-content w-6 h-6 ml-2 text-white border-none rounded-none focus:shadow-none focus:outline-none focus:opacity-100 hover:text-white hover:opacity-75 hover:no-underline"
              data-mdb-dismiss="toast"
              aria-label="Close"
            >
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={`p-3 bg-${colors.main} break-words text-white`}>{message}</div>
      </div>
    </div>
  )
}

export default ToastMessage
