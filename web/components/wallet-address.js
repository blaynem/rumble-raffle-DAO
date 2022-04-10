function WalletAddress({ address }) {
  return (
    <span>{address?.substring(0,3)}...{address?.substring(39)}</span>
  )
}

export default WalletAddress