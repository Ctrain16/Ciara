import requests
import json

import discord
from discord.ext import commands

import config as ciara

default_location = ''

class Weather(commands.Cog):

    def __init__(self, bot):
        self.bot = bot


    @commands.command(
        name='location',
        description='Sets a default location to retrieve the weather for.',
        aliases=['loc']
    )
    async def set_default_location(self,ctx,location):
        global default_location
        default_location = location
        await ctx.send(f'Default location set to {default_location}')


    @commands.command(
        description='Retrieves the weather for a specified location\n\nlocation should be in city,country abbreviation format.\nSo for example Toronto,Ca',
        aliases=['w']
    )
    async def weather(self,ctx,location = None):
        global default_location

        url = 'https://community-open-weather-map.p.rapidapi.com/weather'

        headers = {
            'x-rapidapi-key': ciara.weather_api['key'],
            'x-rapidapi-host': ciara.weather_api['host']
        }

        querystring = {
            'q':default_location,
            'units':'metric'
        }

        if location is not None:
            querystring['q'] = location


        if querystring['q'] == '':
                await ctx.send('Please specify a location, or set a default location')
        else:
            response = requests.get(url, headers=headers, params=querystring)
            json_response = json.loads(response.text)

            await ctx.send(f'Current temp in ' + querystring['q'] + ' : ' + str(round(json_response['main']['temp'])) + '°C')


def setup(bot):
    bot.add_cog(Weather(bot))
    