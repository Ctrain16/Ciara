import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  TextBasedChannel,
} from 'discord.js';
import axios from 'axios';
import { Command } from '..';

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export const Trivia: Command = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Asks a trivia question'),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.channel) {
      return await interaction.reply(
        `This command needs to be used in a channel.`
      );
    }
    const channel: TextBasedChannel = interaction.channel;
    const question: Question = await fetchQuestion();

    const answers = [
      question.correct_answer,
      ...question.incorrect_answers,
    ].map((answer) => decodeURIComponent(answer));
    const shuffledAnswers = shuffleArray(answers);

    const answersMap = new Map();
    answersMap.set('a', shuffledAnswers[0]);
    answersMap.set('b', shuffledAnswers[1]);
    answersMap.set('c', shuffledAnswers[2]);
    answersMap.set('d', shuffledAnswers[3]);

    const triviaEmbed = new EmbedBuilder()
      .setColor(0xcc7ad3)
      .setTitle(`${decodeURIComponent(question.question)}`)
      .setAuthor({
        name: `${interaction.user.username}'s trivia question`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setDescription(
        `*You have 15 seconds to answer with the correct letter*\n\nA) ${answersMap.get(
          'a'
        )}\nB) ${answersMap.get('b')}\nC) ${answersMap.get(
          'c'
        )}\nD) ${answersMap.get('d')}`
      )
      .setFields(
        {
          name: 'Difficulty',
          value: `\`${question.difficulty}\``,
          inline: true,
        },
        {
          name: 'Category',
          value: `\`${decodeURIComponent(question.category)}\``,
          inline: true,
        }
      );

    await interaction.reply({ embeds: [triviaEmbed] });

    let answer: string | null = null;
    let answerMessage: Message | null = null;
    const collector = channel.createMessageCollector({
      filter: () => true,
      time: 15000,
    });

    collector.on('collect', (message: Message) => {
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
        // TODO add tracking for correct trivia point answers... would have a leaderboard to go along with it. Should also track correctness %
        if (answersMap.get(answer) === formattedCorrectAnswer) {
          answerMessage!.reply(`that's correct! Here's a gold star ⭐`);
        } else {
          answerMessage!.reply(
            `no dummy.... the correct answer was \`${formattedCorrectAnswer}\``
          );
        }
      } else {
        interaction.followUp(
          `to slow.... the correct answer was \`${formattedCorrectAnswer}\``
        );
      }
    });
  },
};

function shuffleArray(array: any[]): any[] {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

async function fetchQuestion(): Promise<Question> {
  try {
    const res = await axios.get(
      `https://opentdb.com/api.php?amount=1&type=multiple&encode=url3986`
    );
    return res.data.results[0];
  } catch (error) {
    console.error('Failed to fetch trivia question.');
    throw error;
  }
}
