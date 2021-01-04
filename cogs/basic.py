import discord
from discord.ext import commands
from discord.utils import get

default_role = 'member'

class Basic(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    #Events
    @commands.Cog.listener()
    async def on_member_join(self, member):
        guild = member.guild
        if guild.system_channel is not None:
            await guild.system_channel.send('Welcome {0.mention}, to {1.name}!'.format(member, guild))
        role = get(member.guild.roles, name=default_role)
        await member.add_roles(role)

    @commands.Cog.listener()
    async def on_member_remove(self, member):
        guild = member.guild
        if guild.system_channel is not None:
            await guild.system_channel.send('{0.mention} has left {1.name}.... :('.format(member, guild))


    #Commands
    @commands.command(description='Evaluates a math equation', aliases=['c','calc','math'])
    async def compute(self,ctx,*,equation):
        await ctx.send(f'{eval(equation)} = {equation}')

    @commands.command(description='Retrieves latency of bot')
    async def ping(self,ctx):
        await ctx.send(f'{round(self.bot.latency * 1000)}ms')

    @commands.command(description='Sets default role to assign to new members', aliases=['set default role','setDefRole','sdr'])
    async def role(self,ctx,*,role):
        default_role = role
        await ctx.send(f'Default role set to: {default_role}')

    
def setup(bot):
    bot.add_cog(Basic(bot))
