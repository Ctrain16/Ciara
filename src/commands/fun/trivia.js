const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const axios = require('axios').default;

module.exports = class TriviaCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'trivia',
      group: 'fun',
      memberName: 'trivia',
      description: 'Poses a trivia question.',
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  async run(msg) {
    const res = await axios.get(
      `https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986`
    );
    const question = res.data.results[0];

    const shuffledAnswers = [
      question.correct_answer,
      ...question.incorrect_answers,
    ].map((answer) => decodeURIComponent(answer));
    this.shuffleArray(shuffledAnswers);

    const answers = new Map();
    answers.set('a', shuffledAnswers[0]);
    answers.set('b', shuffledAnswers[1]);
    answers.set('c', shuffledAnswers[2]);
    answers.set('d', shuffledAnswers[3]);

    const triviaEmbed = new Discord.MessageEmbed({
      title: `${decodeURIComponent(question.question)}`,
      color: 0xcc7ad3,
      description: `*You have 15 seconds to answer with the correct letter*\n\nA) ${answers.get(
        'a'
      )}\nB) ${answers.get('b')}\nC) ${answers.get('c')}\nD) ${answers.get(
        'd'
      )}`,
      fields: [
        {
          name: 'Difficulty',
          value: `\`${question.difficulty}\``,
          inline: true,
        },
        {
          name: 'Category',
          value: `\`${decodeURIComponent(question.category)}\``,
          inline: true,
        },
      ],
    }).setAuthor(
      `${msg.author.username}'s trivia question`,
      msg.author.displayAvatarURL()
    );
    await msg.channel.send(triviaEmbed);

    let answer = null;
    let answerMessage = null;
    const collector = new Discord.MessageCollector(msg.channel, (m) => true, {
      time: 15000,
    });
    collector.on('collect', (message) => {
      if (['a', 'b', 'c', 'd'].includes(message.content.toLowerCase())) {
        answer = message.content.toLowerCase();
        answerMessage = message;
        collector.stop();
      }
    });
    collector.on('end', () => {
      const formattedCorrectAnswer = decodeURIComponent(
        question.correct_answer
      );
      if (answer) {
        if (answers.get(answer) === formattedCorrectAnswer) {
          answerMessage.reply(`that's correct! Here's a gold star ⭐`);
        } else {
          answerMessage.reply(
            `no dummy.... the correct answer was \`${formattedCorrectAnswer}\``
          );
        }
      } else {
        msg.channel.send(
          `to slow.... the correct answer was \`${formattedCorrectAnswer}\``
        );
      }
    });
  }
};
