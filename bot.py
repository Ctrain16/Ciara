import os

import discord
from discord.ext import commands

import config

intents = discord.Intents.default()
intents.members = True


bot = commands.Bot(
    command_prefix=config.discord_secrets['prefix'],
    intents=intents, 
    description='C.I.A.R.A. = Cal\'s Intelligent And Responsive Automaton'
)


@bot.event
async def on_ready():
    await bot.change_presence(status=discord.Status.online, activity=discord.Activity(type=discord.ActivityType.listening, name = 'my creator'))
    print(f'{bot.user.name} is ready.\n')


@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
                await ctx.send('Error: Command was not found')
                print('Error: Command was not found\n')
    print(error)


def is_it_developer(ctx):
    for id in config.developer_ids:
        if ctx.author.id == int(id):
            return True
    return False


#Hidden commands for development purposes
@bot.command(
    name='load',
    description='loads a specified extension',
    hidden=True
)
@commands.check(is_it_developer)
async def load(ctx, extension):
    bot.load_extension(f'cogs.{extension}')
    print(f'loaded {extension}\n')


@bot.command(
    name='unload',
    description='unloads a specified extension',
    hidden=True
)
@commands.check(is_it_developer)
async def unload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')
    print(f'unloaded {extension}\n')


@bot.command(
    name='reload',
    description='reloads a specified extension',
    hidden=True
)
@commands.check(is_it_developer)
async def reload(ctx, extension):
    bot.unload_extension(f'cogs.{extension}')
    bot.load_extension(f'cogs.{extension}')
    print(f'reloaded {extension}\n')


#Loads all cogs
for filename in os.listdir('./cogs'):
    if filename.endswith('.py'):
        bot.load_extension(f'cogs.{filename[:-3]}')


bot.run(config.discord_secrets['token'])
