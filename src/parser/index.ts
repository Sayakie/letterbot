import * as weather from './weather';
import * as news from './news';
import * as date from './date';

const parser = async () => {
  try {
    const weatherContent = await weather.parse();
    const newsContent = await news.parse();
    const dateContent = date.parser();
  
    return {
      weather: weatherContent,
      news: newsContent,
      date: dateContent,
    };
  } catch (err: any) {
    console.error(`Errot occured at parser: ${err}`)
  }
};

export default parser;
