import { ToastTypes } from '@rumble-raffle-dao/types';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import Head from 'next/head'
import { useState } from 'react';
import ToastMessage from '../components/toast';
import { usePreferences } from '../containers/preferences';
import { useWallet } from '../containers/wallet';
import userSettingsSchema from '../lib/schemaValidations/userSettings';
import { withSessionSsr } from '../lib/with-session';

type SettingsTypes = {
  name: string;
}

const customErrorColors = (msg: string) => <div className='text-base h-10 text-red-600 py-2'>{msg}</div>

const pageTitle = `Settings`
export default function PageIndex() {
  const { user, updateName } = useWallet();
  const { preferences } = usePreferences();

  const [toastOpen, setToastOpen] = useState(false);
  const [toast, setToast] = useState(null as ToastTypes);

  const headerClass = "mb-2 uppercase leading-7 text-lg font-medium dark:text-rumbleSecondary text-rumblePrimary";
  const fieldClass = 'h-14 dark:focus:ring-rumbleNone focus:ring-rumbleOutline dark:focus:border-rumbleNone focus:border-rumbleOutline dark:bg-rumbleBgDark bg-rumbleNone dark:text-rumbleNone text-rumbleOutline flex-1 block w-full border-none';
  const labelClass = "mb-1 uppercase block text-base font-medium leading-6 dark:text-rumbleNone text-rumbleOutline";

  const handleSetToast = (options: ToastTypes | null) => {
    if (!options) {
      setToastOpen(false)
      return;
    }
    const { message, type } = options;
    setToast({ message, type })
    setToastOpen(true)
  }

  const handleSubmit = async (values: SettingsTypes) => {
    return await fetch(`/api/users/${user.id}`, {
      method: 'POST',
      body: JSON.stringify(values)
    }).then(res => res.json())
  }

  if (!user || !user.id) {
    return (
      <div className={`text-center ${preferences?.darkMode ? 'dark' : 'light'}`}>
        <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
          <h2 className="text-lg leading-6 font-medium dark:text-rumbleNone text-rumbleOutline">You must log in.</h2>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Change user settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Formik
        initialValues={{ name: user?.name }}
        validationSchema={userSettingsSchema}
        onSubmit={(values, { setSubmitting }: FormikHelpers<SettingsTypes>) => {
          handleSubmit(values).then((res) => {
            if (res.error) {
              setSubmitting(false);
              handleSetToast({ type: 'ERROR', message: res.error || 'There was an error saving the settings.' });
              return;
            }
            setSubmitting(false);
            handleSetToast({ type: 'SUCCESS', message: "Settings saved." });
            updateName(values.name);
          })
        }}
      >
        {({ isSubmitting }) => (
          <Form className={`${preferences?.darkMode ? 'dark' : 'light'}`}>
            <div className='dark:bg-black bg-rumbleBgLight w-full mx-auto py-8 px-6 lg:px-[15%] md:px-[10%] sm:px-10 overflow-auto scrollbar-thin dark:scrollbar-thumb-rumbleSecondary scrollbar-thumb-rumblePrimary scrollbar-track-rumbleBgDark"' style={{ height: 'calc(100vh - 58px)' }}>
              <div className='absolute top-2 right-2 z-20'>
                {toastOpen && <ToastMessage message={toast.message} type={toast.type} onClick={() => handleSetToast(null)} />}
              </div>
              <h3 className="uppercase text-2xl font-medium leading-9 dark:text-rumbleNone text-rumbleOutline">Settings</h3>
              <p className="mb-20 text-base leading-6 dark:text-rumbleNone text-rumbleOutline opacity-60">
                Change user settings.
              </p>
              <div className="mb-20">
                <h4 className={headerClass}>User</h4>
                <div className="grid grid-cols-7 gap-6">
                  <div className="col-span-7 sm:col-span-3">
                    <label htmlFor="user-name" className={labelClass}>
                      Name
                    </label>
                    <div className="flex">
                      <Field
                        type="text"
                        name="name"
                        id="user-name"
                        className={fieldClass}
                        placeholder="Desired Name"
                      />
                    </div>
                    <ErrorMessage name="name" >
                      {msg => customErrorColors(msg)}
                    </ErrorMessage>
                  </div>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="uppercase h-14 mr-8 py-4 px-6 border-2 dark:border-rumbleBgLight border-rumbleBgDark dark:bg-rumbleBgLight bg-rumbleBgDark dark:hover:bg-rumbleSecondary dark:hover:border-rumbleSecondary hover:bg-rumblePrimary hover:border-rumblePrimary dark:text-rumbleOutline text-rumbleNone font-medium"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}