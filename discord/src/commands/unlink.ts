import {
  CacheType,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js'
import { unlinkDiscordButton } from '../buttons'

export const unlinkAccount = async (interaction: CommandInteraction<CacheType>) => {
  const button = new ButtonBuilder()
    .setCustomId(unlinkDiscordButton.customId)
    .setLabel('Unlink Discord')
    .setStyle(ButtonStyle.Danger)

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

  interaction.reply({
    ephemeral: true,
    content: 'Are you sure you want to unlink your discord id?',
    components: [row]
  })
}
