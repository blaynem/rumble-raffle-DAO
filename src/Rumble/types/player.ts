export interface PlayerType {
  // Player id will be based on wallet
  id: string;
  // Player might have a chosen name they set, if not we will supply them a random one.
  name?: string;
}
