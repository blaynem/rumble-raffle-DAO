import { Message } from 'discord.js';
import { BASE_WEB_URL } from '../../constants';
import { GuildConfig, GuildContextInterface } from './types';

/**
 * A guilds context to keep track of useful details.
 */
class GuildContext implements GuildContextInterface {
  /**
   * The given guilds id.
   */
  private guildId: string;
  /**
   * Slug for the Guilds rumble raffle games.
   */
  private slug: string;

  /**
   * Guilds channel id that bot should reply in.
   */
  private channelId: string;
  /**
   * We keep track of the message id that way we can edit the message.
   * 
   * The message should be overwritten any time these functions fire:
   * - createNewGame
   * - syncPlayerRoomData
   */
  private currentMessage: Message<boolean>;
  /**
   * The current room params Id in the database
   */
  private currentParamsId: string;
  /**
   * Keep track of the current round we're in.
   */
  private currentRound: number;
  /**
   * Whether the game has completed yet or not.
   */
  private gameCompleted: boolean;
  /**
   * Whether the game has started yet or not.
   */
  private gameStarted: boolean;

  constructor(config: GuildConfig) {
    this.guildId = config.guildId
    // Setting slug to guild id because it's easier that way.
    this.slug = config.guildId
  }

  getGuildId() {
    return this.guildId;
  }

  getSlug() {
    return this.slug;
  }

  getChannelId() {
    return this.channelId;
  }

  setChannelId(channelId: string) {
    this.channelId = channelId;
  }

  getCurrentParamsId() {
    return this.currentParamsId;
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

  getGameCompleted() {
    return this.gameCompleted;
  }

  setGameCompleted(completed: boolean) {
    this.gameCompleted = completed;
  }

  /**
   * Resets game started and current round
   */
  resetGame() {
    this.setCurrentMessage(null);
    this.setCurrentRound(null)
    this.gameStarted = false;
  }

  /**
   * Set current round to 0 and set game started to true.
   */
  gameStart() {
    this.setCurrentRound(0);
    this.gameStarted = true;
  }
}

class AllGuildContexts {
  /**
   * Map of all guilds by their id.
   */
  private guilds = new Map<string, GuildContext>()

  /**
   * Add guild to all guild contexts, and subscribe to it's events.
   */
  addGuild(config: GuildConfig) {
    this.guilds.set(config.guildId, new GuildContext(config));

    return this.guilds.get(config.guildId);
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
    return Array.from(this.guilds.values()).find(guild => guild.getSlug() === slug)
  }
}

export { AllGuildContexts, GuildContext };