import { CacheType, CommandInteraction, MessageActionRow, MessageButton } from 'discord.js';
import { UNLINK_DISCORD_BUTTON_ID } from '../../sockets';

export const unlinkAccount = async (interaction: CommandInteraction<CacheType>) => {
  const button = new MessageButton()
    .setCustomId(UNLINK_DISCORD_BUTTON_ID)
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