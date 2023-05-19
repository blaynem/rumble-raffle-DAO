import { RUMBLE_RAFFLE_GUILD_ID, LOGGING_CHANNEL_ID } from '../../constants'
import Logger from './logger'

const rumbleLogger = new Logger({ guildId: RUMBLE_RAFFLE_GUILD_ID, channelId: LOGGING_CHANNEL_ID })

export { rumbleLogger }
