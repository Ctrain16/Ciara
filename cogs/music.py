import os

import discord
from discord.ext import commands
from discord.utils import get
import youtube_dl

class Music(commands.Cog):

    def __init__(self, bot):
        self.bot = bot


    @commands.command(
        name='play',
        description='Plays audio',
        aliases=['p']
    )
    async def join(self,ctx, url : str):
        song_file = os.path.isfile('song.mp3')
        try:
            if song_file:
                os.remove('song.mp3')
        except PermissionError:
            #Add queue structure... also need to add skip command 
            await ctx.send('A song is already playing\n')

        channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice and voice.is_connected:
            await voice.move_to(channel)
        else:
            voice = await channel.connect()


        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        for file in os.listdir('./'):
            if file.endswith('.mp3'):
                os.rename(file, 'song.mp3')
        
        voice.play(discord.FFmpegPCMAudio('song.mp3'))

        print(f'Ciara connected to {channel} and began playing music\n')


    @commands.command(
        name='disconnect',
        description='Disconnects Ciara - requires user to be in same voice channel',
        aliases=['dc']
    )
    async def disconnect(self,ctx):
        user_channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice and voice.is_connected and voice.channel == user_channel:
            await voice.disconnect()
            print(f'Ciara disconnected from {voice.channel}\n')

    
    @commands.command(
        name='pause',
        description='Pauses what Ciara is playing'
    )
    async def pause(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice.is_playing():
            voice.pause()
            print('Music: paused\n')
        else:
            print('Music: no music to pause\n')

    
    @commands.command(
        name='resume',
        description='Resumes what Ciara is playing',
        aliases=['res']
    )
    async def resume(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice.is_paused():
            voice.resume()
            print('Music: resumed\n')
        else:
            print('Music: nothing to resume\n')

    
    @commands.command(
        name='stop'
    )
    async def stop(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)
        voice.stop()
        print('Music: stopped\n')


def setup(bot):
    bot.add_cog(Music(bot))
