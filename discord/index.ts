require('dotenv').config()
// Require the necessary discord.js classes
import { CacheType, Client, CommandInteraction, Intents, Interaction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { initSockets } from "./sockets";
const token = process.env.DISCORD_TOKEN

const RUMBLE_CHANNEL_ID = '983207646821777489';

interface Options {
  /**
   * Id of discord channel that text will be sent to.
   */
  channelId: string;
}

const options: Options = {
  channelId: RUMBLE_CHANNEL_ID,
}

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
  console.log('Ready!');

  initSockets();
});


client.on('interactionCreate', async interaction => {
  console.log('--interaction', interaction);
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    // await interaction.reply('Pong!');

  } else if (commandName === 'start') {
    console.log('--start command');
    // await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
  } else if (commandName === 'create') {
    console.log('--create command');
    // await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
  }
});

// Login to Discord with your client's token
client.login(token);


// const showButtonExample = async (interaction: CommandInteraction) => {
//   const row = new MessageActionRow()
//     .addComponents(
//       new MessageButton()
//         .setCustomId('primary')
//         .setLabel('Primary')
//         .setStyle('PRIMARY'),
//     );
//   const embed = new MessageEmbed()
//     .setColor('#0099ff')
//     .setTitle('Some title')
//     .setURL('https://discord.js.org')
//     .setDescription('Some description here');

//   await interaction.reply({ content: 'Pong!', ephemeral: true, embeds: [embed], components: [row] });
// }