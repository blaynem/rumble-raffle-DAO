import { CacheType, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { unlinkDiscordButton } from '../buttons';

export const unlinkAccount = async (interaction: CommandInteraction<CacheType>) => {
  const button = new MessageButton()
    .setCustomId(unlinkDiscordButton.customId)
    .setLabel('Unlink Discord')
    .setStyle('DANGER');

  const row = new MessageActionRow()
    .addComponents(button);

  interaction.reply({
    ephemeral: true,
    content: 'Are you sure you want to unlink your discord id?',
    components: [row]
  })
}