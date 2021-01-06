import random

import discord
from discord.ext import commands

import config as ciara

class Fun(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    #Commands
    @commands.command(description='Answers a question', aliases=['8ball','8'])
    async def eightball(self,ctx,*,question):
        eightball_responses = ['It is certain.',
                                'It is decidedly so.',
                                'Without a doubt.',
                                'Yes – definitely.',
                                'You may rely on it.',
                                'As I see it, yes.',
                                'Most likely.',
                                'Outlook good.',
                                'Yes.',
                                'Signs point to yes.',
                                'Reply hazy, try again.',
                                'Ask again later.',
                                'Better not tell you now.',
                                'Cannot predict now.',
                                'Concentrate and ask again.',
                                'Don\'t count on it.',
                                'My reply is no.',
                                'My sources say no.',
                                'Outlook not so good.',
                                'Very doubtful.']
        await ctx.send(f'{random.choice(eightball_responses)}')

    @commands.command(description='Talks trash about a specified member', aliases=['insult'])
    async def chirp(self,ctx,member : discord.Member):
        insults = ['a milkbag',
                    'dogwater',
                    'freer than a costco sample',
                    'mom is a hoe',
                    'a jett main with a 0.5 k.d.',
                    'freer than Mcdonald\'s wifi',
                    'a snollygoster',
                    'a pillick',
                    'a nitwit',
                    'a dunce',
                    'a dipstick',
                    'a bonehead',
                    'a dingbat',
                    'an arsehole',
                    'a literal cow',
                    'a twat',
                    'a lickspittle',
                    'a ninny',
                    'a simpleton',
                    'a fartface',
                    'a bum',
                    'a ninnyhammer',
                    'a mumpsimus',
                    'a pettifogger',
                    'a mooncalf',]
        
        #Ciara doesn't chirp her friends
        member_is_friend = 0
        for id in ciara.ciaras_friends_ids:
            if member.id == int(id):
                member_is_friend = 1
            
        if member_is_friend:
            await ctx.send('I do not chirp my friends :)')
        elif member.id == int(ciara.discord_secrets['ciara_id']):
            await ctx.send('Why would I chirp myself?')
        else:
            await ctx.send('{0.mention}... you\'re '.format(member) + f'{random.choice(insults)}')

def setup(bot):
    bot.add_cog(Fun(bot))
