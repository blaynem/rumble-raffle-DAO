import { recoverPersonalSignature } from "eth-sig-util";
import { bufferToHex } from "ethereumjs-util";

/**
 * Verify an eth signature
 */
const verifySignature = (id: string, signature: string, message: string): boolean => {
  const msgBufferHex = bufferToHex(Buffer.from(message, 'utf8'))
  const address = recoverPersonalSignature({
    data: msgBufferHex,
    sig: signature as string,
  })
  return address.toLowerCase() === id.toLowerCase();
}

export default verifySignature;