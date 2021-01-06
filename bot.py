import os

import discord
from discord.ext import commands

import config as ciara

intents = discord.Intents.default()
intents.members = True

description = 'C.I.A.R.A. = Cal\'s Intelligent And Responsive Automaton'

bot = commands.Bot(command_prefix=ciara.discord_secrets['prefix'], intents=intents, description=description)

@bot.event
async def on_ready():
    await bot.change_presence(status=discord.Status.online, activity=discord.Activity(type=discord.ActivityType.listening, name = 'to my creator'))
    print('Bot is ready.')


#Hidden commands for development purposes
@bot.command(hidden=True)
async def load(ctx, extension):
    bot.load_extension(f'cogs.{extension}')
    print(f'loaded {extension}')

@bot.command(hidden=True)
async def unload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')
    print(f'unloaded {extension}')

@bot.command(hidden=True)
async def reload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')
    bot.load_extension(f'cogs.{extension}')
    print(f'reloaded {extension}')

#Loads all cogs
for filename in os.listdir('./cogs'):
    if filename.endswith('.py') and filename != 'config.py':
        bot.load_extension(f'cogs.{filename[:-3]}')


bot.run(ciara.discord_secrets['token'])
