import MiddleEllipsis from 'react-middle-ellipsis'

function WalletAddress({ address }) {
  return (
    <div style={{ width: '100px' }}>
      <MiddleEllipsis>
        <span>{address}</span>
      </MiddleEllipsis>
    </div>
  )
}

export default WalletAddress