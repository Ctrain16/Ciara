import discord
from discord.ext import commands
from discord.utils import get

class Music(commands.Cog):

    def __init__(self, bot):
        self.bot = bot


    @commands.command(
        name='play',
        description='Plays audio',
        aliases=['p']
    )
    async def join(self,ctx):
        channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice and voice.is_connected:
            await voice.move_to(channel)
        else:
            voice = await channel.connect()

        print(f'Ciara connected to {channel}')


    @commands.command(
        name='disconnect',
        description='Disconnects Ciara',
        aliases=['dc']
    )
    async def disconnect(self,ctx):
        user_channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice and voice.is_connected and voice.channel == user_channel:
            await voice.disconnect()
            print(f'Ciara disconnected from {voice.channel}')


def setup(bot):
    bot.add_cog(Music(bot))
