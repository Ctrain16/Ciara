import requests
import json

import discord
from discord.ext import commands

import config as ciara

class Weather(commands.Cog):

    def __init__(self, bot):
        self.bot = bot

    @commands.command(
        description='Retrieves the weather for a specified location\n\nlocation should be in city,country abbreviation format.\nSo for example Toronto,Ca',
        aliases=['w']
    )
    async def weather(self,ctx,location):

        url = 'https://community-open-weather-map.p.rapidapi.com/weather'

        headers = {
            'x-rapidapi-key': ciara.weather_api['key'],
            'x-rapidapi-host': ciara.weather_api['host']
        }

        querystring = {
            'q':location,
            'units':'metric'
        }

        response = requests.get(url, headers=headers, params=querystring)
        json_response = json.loads(response.text)
        

        await ctx.send(json_response['main']['temp'])


def setup(bot):
    bot.add_cog(Weather(bot))
    