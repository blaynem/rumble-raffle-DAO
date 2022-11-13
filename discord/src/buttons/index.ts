import { ButtonInteraction, CacheType } from "discord.js";
import { verifyAccount } from "./verifyAccount";
import { unlinkDiscord } from "./unlinkDiscord";

export const unlinkDiscordButton = {
  callback: (interaction: ButtonInteraction<CacheType>) => unlinkDiscord(interaction),
  customId: 'unlinkDiscordId',
  name: 'Unlink Discord',
}

export const verifyAccountButton = {
  callback: (interaction: ButtonInteraction<CacheType>) => verifyAccount(interaction),
  customId: 'verifyAccountId',
  name: 'Verify Account',
}

const interactionButtons = [
  unlinkDiscordButton,
  verifyAccountButton,
]

/**
 * Finds the command that was called, and fires it.
 * 
 * @param interaction - the Button Interaction from the client
 */
export const getButtonInteraction = (interaction: ButtonInteraction<CacheType>) => {
  const button = interactionButtons.find(btn => btn.customId === interaction.customId);
  if (button) {
    button.callback(interaction);
  }
}