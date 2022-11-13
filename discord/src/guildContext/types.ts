import { GuildMemberRoleManager } from "discord.js";

export type Config = {
  /**
   * Array of admin role ids to be used.
   */
   adminRoleIds: string[];
   /**
    * The given guilds id.
    */
   guildId: string;
   /**
    * Slug for the Guilds rumble raffle games.
    */
   slug: string;
}

export interface GuildContextInterface {
  /**
   * Returns if the user is an admin or not.
   */
  isAdmin: (roles: string[]) => boolean;
}