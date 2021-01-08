import os, urllib.parse, urllib.request, re, shutil

import discord
from discord.ext import commands
from discord.utils import get
import youtube_dl

song_queue = []

class Music(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        

    @commands.command(
        name='play',
        description='Plays requested song\n\n<song_request> can either be a url or a title which will be searched for on youtube',
        aliases=['p']
    )
    async def play(self,ctx,*,song_request : str = ''):
        global song_queue

        #Functions as resume command when no url is passed
        if song_request == '':
            await ctx.invoke(self.bot.get_command('resume'))
            return

        #Removes old song file if not in use
        song_file = os.path.isfile('song.mp3')
        try:
            if song_file:
                os.remove('song.mp3')
                print('Music: Removed old song file\n')
        except PermissionError:
            await ctx.invoke(self.bot.get_command('queue'), song_request=song_request)
            return

        def check_queue():
            if len(song_queue) > 0:
                end_of_file_name = song_queue.pop(0) + '.mp3'
                print(end_of_file_name)
                os.remove('song.mp3')
                print('Music: Removed old song file\n')

                #Change file name and retrieves title from file name
                song_title = ''
                for file in os.listdir('./'):
                    if file.endswith(end_of_file_name):
                        song_title = file
                        print(f'Music: Renamed file {file} to song.mp3\n')
                        os.rename(file, 'song.mp3')

                voice.play(
                    discord.FFmpegPCMAudio('song.mp3'),
                    after= lambda e: check_queue()
                )

        
        #Search for song on youtube and get url
        search_query = urllib.parse.urlencode({'search_query': song_request})
        htm_content = urllib.request.urlopen(
            'http://www.youtube.com/results?' + search_query
        )
        search_results = re.findall(r'/watch\?v=(.{11})', htm_content.read().decode())
        song_url = 'http://www.youtube.com/watch?v=' + search_results[0]
        print(f'Music: {song_url}')

        #Download song
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([song_url])

        #Change file name and retrieves title from file name
        song_title = ''
        for file in os.listdir('./'):
            if file.endswith('.mp3'):
                song_title = file
                print(f'Music: Renamed file {file} to song.mp3\n')
                os.rename(file, 'song.mp3')
        
        #Join Channel & begin playing
        channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)
        if voice and voice.is_connected:
            await voice.move_to(channel)
        else:
            voice = await channel.connect()
        voice.play(
            discord.FFmpegPCMAudio('song.mp3'),
            after= lambda e: check_queue()
        )

        #Prints confirmation
        length_to_slice = len(search_results[0]) + 5
        song_title = song_title[:-length_to_slice]
        print(f'Music: Ciara connected to {channel} and began playing: {song_title}\n')
        await ctx.send(f'Began playing : {song_title}')


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
            print(f'Music: Ciara disconnected from {voice.channel}\n')

    
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

    
    @commands.command(
        name='queue',
        aliases=['q']
    )
    async def queue(self,ctx,song_request):
        global song_queue

        print(f'Music: {song_request} added to queue\n')
        await ctx.send(f'{song_request} was added to the queue\n')

        #Search for song on youtube and get url
        search_query = urllib.parse.urlencode({'search_query': song_request})
        htm_content = urllib.request.urlopen(
            'http://www.youtube.com/results?' + search_query
        )
        search_results = re.findall(r'/watch\?v=(.{11})', htm_content.read().decode())
        song_url = 'http://www.youtube.com/watch?v=' + search_results[0]
        print(f'Music: {song_url}')

        song_queue.append(search_results[0])
        print(f'Music: Queue: {song_queue}\n')

        #Download song
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([song_url])


def setup(bot):
    bot.add_cog(Music(bot))
