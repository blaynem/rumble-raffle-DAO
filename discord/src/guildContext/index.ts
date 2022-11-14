import { Message, TextChannel } from 'discord.js';
import { BASE_WEB_URL } from '../../constants';
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

  /**
   * Guilds channel id that bot should reply in.
   */
  channelId: string;
  /**
   * We keep track of the message id that way we can edit the message.
   * 
   * The message should be overwritten any time these functions fire:
   * - createNewGame
   * - syncPlayerRoomData
   */
  currentMessage: Message<boolean>;
  /**
   * The current room params Id in the database
   */
  currentParamsId: string;
  /**
   * Keep track of the current round we're in.
   */
  currentRound: number;
  /**
   * Whether the game has started yet or not.
   */
  gameStarted: boolean;

  constructor(config: Config) {
    this.adminRoleIds = config.adminRoleIds
    this.guildId = config.guildId
    this.slug = config.slug
  }

  isAdmin(roles: string[]) {
    return this.adminRoleIds.some(id => roles.includes(id));
  };

  setChannelId(channelId: string) {
    this.channelId = channelId;
  }

  setCurrentParamsId(id: string) {
    this.currentParamsId = id;
  }

  getGameUrl() {
    return `${BASE_WEB_URL}/${this.slug}`;
  }

  getCurrentMessage() {
    return this.currentMessage;
  }

  setCurrentMessage(message: Message<boolean>) {
    this.currentMessage = message;
  }

  getCurrentRound() {
    return this.currentRound;
  }

  setCurrentRound(round: number) {
    this.currentRound = round;
  }

  getGameStarted() {
    return this.gameStarted;
  }

  setGameStarted(started: boolean) {
    this.gameStarted = started;
  }
}

class AllGuildContexts {
  /**
   * Map of all guilds by their id.
   */
  private guilds = new Map<string, GuildContext>()

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

  getGuildBySlug(slug: string): GuildContext {
    return Array.from(this.guilds.values()).find(guild => guild.slug === slug)
  }
}

export { AllGuildContexts, GuildContext };