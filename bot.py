import discord
import os
import config
from discord import client
from discord.ext import commands

intents = discord.Intents.default()
intents.members = True

description = 'C.I.A.R.A. = Cal\'s Intelligent And Responsive Automaton'

bot = commands.Bot(command_prefix=config.myBot['prefix'], intents=intents, description=description)

@bot.event
async def on_ready():
    await bot.change_presence(status=discord.Status.online, activity=discord.Activity(type=discord.ActivityType.listening, name = 'to my creator'))
    print('Bot is ready.')


#Hidden commands for development purposes
@bot.command(hidden=True)
async def load(ctx, extension):
    bot.load_extension(f'cogs.{extension}')

@bot.command(hidden=True)
async def unload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')

@bot.command(hidden=True)
async def reload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')
    bot.load_extension(f'cogs.{extension}')


#Loads all cogs
for filename in os.listdir('./cogs'):
    if filename.endswith('.py'):
        bot.load_extension(f'cogs.{filename[:-3]}')


bot.run(config.myBot['token'])
