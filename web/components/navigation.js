import WalletConnector from 'components/wallet-connector'
import { useWallet } from 'containers/wallet'
import MiddleEllipsis from 'react-middle-ellipsis'

function Navigation() {
  const { user } = useWallet()
  return (
    <>
      {!user && <WalletConnector />}
      {user && (
        <div style={{ width: '100px' }}>
          <MiddleEllipsis>
            <span>{user.publicAddress}</span>
          </MiddleEllipsis>
        </div>
      )}
    </>
  )
}
export default Navigation