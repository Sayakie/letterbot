import axios from 'axios';

interface discordArgs {
  weather: {
    weather: string;
    temp: string;
  };
  news: string;
  date: string;

  url: string;
}

export default async({ weather, news, date, url }: discordArgs) => {
  const today = new Date().toLocaleDateString().replace(/\. /g, '-').replace('.', '');

  let message: any = {
    username: '부관',
    avatar_url: 'https://raw.githubusercontent.com/Sayakie/letterbot/master/FB_IMG_1580711421750.jpg',
    
    content:  `📨 ${today} 편지가 왔어요!`,

    embeds: [],
  };

  message.embeds.push({
    color: '#928BFF',
    fields: [
      {
        name: '📅 날짜 / 한국',
        value: `${today} ${date ? '(' + date + ')' : ''}`,
        inline: true
      },
      {
        name: '🏞️ 날씨 / 목포',
        value: weather.weather,
        inline: true
      },
      {
        name: '🌡 온도 / 목포',
        value: weather.temp,
        inline: true
      }
    ],
    footer: {
      text: '',
      icon_url: 'https://images-ext-2.discordapp.net/external/GyQicPLz_zQO15bOMtiGTtC4Kud7JjQbs1Ecuz7RrtU/https/cdn.discordapp.com/embed/avatars/1.png'
    },
  });

  message.embeds.push({
    title: '📰 뉴스 / 구글',
    description: news
  });

  await axios.post(url, message);
};
