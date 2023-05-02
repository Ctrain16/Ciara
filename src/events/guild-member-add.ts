import { EmbedBuilder, Events, GuildMember, Interaction } from 'discord.js';
import { EventDefinition } from '.';

export const GuildMemberAdd: EventDefinition = {
  name: Events.GuildMemberAdd,
  runOnce: false,
  execute: async (member: GuildMember) => {
    const channel = member.guild.systemChannel;

    if (!channel) {
      throw new Error(
        `Failed to send welcome message for ${member.user.username} as no system channel is configured`
      );
    }

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`${member.client.user.username} welcomes you!`)
      .setDescription(
        `Hey ${member}, welcome to **${member.guild}**!\n\nTo find out all I can do type: \n\`\/help\`\n`
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp(new Date())
      .setFooter({
        iconURL: member.client.user.displayAvatarURL(),
        text: 'Ciara',
      });

    channel.send({ embeds: [welcomeEmbed] });

    // TODO: Add support for assigning default roles
  },
};
