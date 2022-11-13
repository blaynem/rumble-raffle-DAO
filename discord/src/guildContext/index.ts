import { Config, GuildContextInterface } from './types';

/**
 * A guilds context to keep track of useful details.
 */
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
  slug: string;

  constructor(config: Config) {
    this.adminRoleIds = config.adminRoleIds
    this.guildId = config.guildId
    this.slug = config.slug
  }

  isAdmin(roles: string[]) {
    return this.adminRoleIds.some(id => roles.includes(id));
  };
}

class AllGuildContexts {
  /**
   * Map of all guilds
   */
  private guilds = new Map<any, GuildContext>()

  /**
   * Add guild to all guild contexts
   */
  addGuild(config: Config) {
    this.guilds.set(config.guildId, new GuildContext(config));
  }
  
  /**
   * Get guild from guild contexts
   */
  getGuild(id: string) {
    return this.guilds.get(id);
  }
  
  /**
   * Remove guild from all guild contexts
   */
  removeGuild(id: string) {
    this.guilds.delete(id);
  }
}

export { AllGuildContexts, GuildContext };