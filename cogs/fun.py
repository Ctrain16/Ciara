import random

import discord
from discord.ext import commands
from discord.ext.commands.cooldowns import BucketType

import config as ciara

class Fun(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    #Commands
    @commands.command(
        name='eightball',
        description='Answers a question', 
        aliases=['8ball','8']
    )
    @commands.cooldown(1, 15, BucketType.user)
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
        print('Fun: the 8ball was asked a question\n')


    @commands.command(
        name='chirp',
        description='Talks trash about a specified member', 
        aliases=['insult']
    )
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
        
        print(f'Fun: {member.name} was chirped\n')

    
    @commands.command(
        name='dice',
        description='Rolls dice\n\nControlled using #dice(d)#sides\nSo if you want to roll 2, 6-sided dice then you would enter 2d6 in place of <dice>',
        aliases=['roll','rd']
    )
    async def dice(self,ctx,dice):
        dice_info = dice.split('d')
        num_dice = int(dice_info[0])
        num_sides = int(dice_info[1])

        all_rolls = ''
        for x in range(num_dice):
            all_rolls = all_rolls + f"dice {x + 1} : " + str(random.randint(1,num_sides)) + "\n"

        await ctx.send(all_rolls)
        print(f'Fun: Dice roll... {dice}\n')


    @commands.command(
        name='coin',
        description='Flips a coin',
        aliases=['flipcoin','flip'],
    )
    async def coin(self,ctx):
        coin_flip = random.randint(1,2)
        if coin_flip == 1:
            await ctx.send('Heads')
        else:
            await ctx.send('Tails')
        print(f'Fun: A coin was flipped, result was {coin_flip}\n')


def setup(bot):
    bot.add_cog(Fun(bot))
