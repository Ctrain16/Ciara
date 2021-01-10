import asyncio
import os, urllib.parse, urllib.request, re, shutil

import discord
from discord.ext import commands
from discord.utils import get
import youtube_dl
import validators

song_queue = []
song_queue_urls = []
queue_count = 0

class Music(commands.Cog):

    def __init__(self, bot):
        self.bot = bot
        

    @commands.command(
        name='play',
        description='Plays requested song\n\n<song_request> can either be a url or a title which will be searched for on youtube',
        aliases=['p']
    )
    async def play(self,ctx,*,song_request : str = ''):
        global song_queue, song_queue_urls, queue_count

        #Functions as resume command when no url is passed
        if song_request == '':
            await ctx.invoke(self.bot.get_command('resume'))
            return

        #delete play message
        await ctx.invoke(self.bot.get_command('deletemessages'), number_messages = 0)

        #Removes old song file if not in use
        song_file = os.path.isfile('current-song.mp3')
        try:
            if song_file:
                os.remove('current-song.mp3')
                print('Music: Removed old song file\n')
        except PermissionError:
            await ctx.invoke(self.bot.get_command('queue'), song_request=song_request)
            return


        #Checks queue after song finishes
        def check_queue(error):
            if len(song_queue) > 0:
                end_of_file_name = song_queue.pop(0)
                print(end_of_file_name)
                os.remove('current-song.mp3')
                print('Music: Removed old song file\n')

                #Change file name and retrieves title from file name
                song_title = ''
                for file in os.listdir('./'):
                    if file.endswith(end_of_file_name):
                        print(f'Music: Renamed file {file} to current-song.mp3\n')
                        os.rename(file, 'current-song.mp3')

                voice.play(
                    discord.FFmpegPCMAudio('current-song.mp3'),
                    after= check_queue
                )

                coro = ctx.send('Began playing : ' + str(song_queue_urls.pop(0)))
                fut = asyncio.run_coroutine_threadsafe(coro, self.bot.loop)
                try:
                    fut.result()
                except:
                    pass
            else:
                queue_count = 0


        
        #Check if request is url (but not youtube url)... if it isn't then search for song on youtube and get url
        song_url = ''
        if validators.url(song_request) and song_request.find('youtube') == -1:
            song_url = song_request
        else:
            search_query = urllib.parse.urlencode({'search_query': song_request})
            htm_content = urllib.request.urlopen(
                'http://www.youtube.com/results?' + search_query
            )
            search_results = re.findall(r'/watch\?v=(.{11})', htm_content.read().decode())
            song_url = 'http://www.youtube.com/watch?v=' + search_results[0]

        #Download song
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': 'current-song.mp3',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([song_url])
        
        #Join Channel & begin playing
        channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)
        if voice and voice.is_connected:
            await voice.move_to(channel)
        else:
            voice = await channel.connect()
        voice.play(
            discord.FFmpegPCMAudio('current-song.mp3'),
            after= check_queue
        )
        
        #Prints confirmation
        print(f'Music: Ciara connected to {channel} and began playing: {song_url}\n')
        await ctx.send(f'Began playing : {song_url}')


    @commands.command(
        name='disconnect',
        description='Disconnects Ciara - requires user to be in same voice channel',
        aliases=['dc']
    )
    async def disconnect(self,ctx):
        user_channel = ctx.message.author.voice.channel
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice and voice.is_connected() and voice.channel == user_channel:
            await ctx.invoke(self.bot.get_command('clearqueue'))
            await voice.disconnect()
            await ctx.send(f'Disconnected from {voice.channel}')
            print(f'Music: Ciara disconnected from {voice.channel}\n')
        else:
            print('Music: Ciara cannot disconnect as she is not connected to any channel\n')

    
    @commands.command(
        name='pause',
        description='Pauses what Ciara is playing'
    )
    async def pause(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)

        if voice.is_playing():
            voice.pause()
            print('Music: paused\n')
            await ctx.send('Paused')
        else:
            print('Music: no music to pause\n')
            await ctx.send('Nothing to pause')

    
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
        name='stop',
        description='Stop current song and clears queue',
    )
    async def stop(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)
        await ctx.invoke(self.bot.get_command('clearqueue'))
        voice.stop()
        await ctx.send('Music was stopped')
        print('Music: stopped\n')

    
    @commands.command(
        name='skip',
        description='Skips current song',
    )
    async def skip(self,ctx):
        voice = get(self.bot.voice_clients, guild = ctx.guild)
        voice.stop()
        await ctx.send('Skipped')
        print('Music: skipped song\n')
    
    
    @commands.command(
        name='queue',
        hidden=True
    )
    async def queue(self,ctx,song_request):
        global song_queue, song_queue_urls, queue_count

        #Check if request is url (but not youtube url)... if it isn't then search for song on youtube and get url
        song_url = ''
        search_results = ''
        if validators.url(song_request) and song_request.find('youtube') == -1:
            song_url = song_request
        else:
            search_query = urllib.parse.urlencode({'search_query': song_request})
            htm_content = urllib.request.urlopen(
                'http://www.youtube.com/results?' + search_query
            )
            search_results = re.findall(r'/watch\?v=(.{11})', htm_content.read().decode())
            song_url = 'http://www.youtube.com/watch?v=' + search_results[0]

        #Download song
        song_file_name = f'song{queue_count}.mp3'
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': song_file_name,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([song_url])

        song_queue.append(song_file_name)
        song_queue_urls.append(song_url)
        queue_count += 1

        print(f'Music: {song_request} was added to the queue\n')
        print(f'Music: Queue -> {song_queue}\n')
        await ctx.send(f'{song_request} was added to the queue\n')        


    @commands.command(
        name='clearqueue',
        description='Clears the song queue',
        aliases=['emptyqueue']
    )
    async def clear_queue(self,ctx):
        global song_queue, song_queue_urls, queue_count

        voice = get(self.bot.voice_clients, guild = ctx.guild)
        for file in os.listdir('./'):
            if file.endswith('.mp3'):
                if voice.is_playing() and file == 'current-song.mp3':
                    print('Song is playing and will not be removed from queue\n')
                else:
                    os.remove(file)
                    if len(song_queue) > 0:
                        song_queue.pop(0)
                        song_queue_urls.pop(0)
                        queue_count -= 1

        print('Music: queue cleared\n')
        await ctx.send('The song queue was cleared')   


def setup(bot):
    bot.add_cog(Music(bot))
