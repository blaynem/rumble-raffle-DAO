import { RumbleInterface } from "@rumble-raffle-dao/rumble"

export type RoomRumbleDataType = {
  [slug: string]: {
    rumble: RumbleInterface,
    id: string,
    slug: string
  }
}