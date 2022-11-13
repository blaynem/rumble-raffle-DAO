// I'm not entirely sure what this will be quite yet.

import { Config, GuildContextInterface } from './types';


class GuildContext implements GuildContextInterface {
  /**
   * Array of admin role ids to be used.
   */
   adminRoleIds: string[]
   /**
    * The given guilds id.
    */
   guildId: string;
   /**
    * Slug for the Guilds rumble raffle games.
    */
   rumbleRaffleSlug: string;
  constructor(config: Config) {
    this.adminRoleIds = config.adminRoleIds
    this.guildId = config.guildId
    this.rumbleRaffleSlug = config.rumbleRaffleSlug
  }

  isAdmin(userId: string) {
    return this.adminRoleIds.indexOf(userId) > -1
  };
}

export default GuildContext;