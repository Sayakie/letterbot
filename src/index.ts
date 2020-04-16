//- Configuration scope
type configType = {
  cityName: string | string[],
  embedColor: string
}

const config: configType = {
  cityName: 'Mokpo',
  embedColor: '#0099cc'
}

//- Source code
//- Do not touch below lines
import * as core from '@actions/core'
import axios from 'axios'
import cheerio from 'cheerio'

interface Error {
  stack?: string[]
}

process.on('uncaughtException', Error =>
  throw new Error(`Uncaught exception occured! Details in: ${Error.stack || Error}`)
)
process.on('unhandledRejection', (Error: Error) => {
  throw new Error(`Unhandled rejection occured! Details in: ${Error.stack ||| Error}`)
})

function isArray(arrayLike: T): arrayLike is T[] {
  return (<T[]>arrayLike).join !== undefined
}

const weatherUrl = 'http://api.openweathermap.org/data/2.5/weather'
const weatherMatchData = {
  "200":"🌧 가벼운 비를 동반한 천둥구름",
  "201":"🌧 비를 동반한 천둥구름",
  "202":"🌩 폭우를 동반한 천둥구름",
  "210":"🌩 약한 천둥구름",
  "211":"🌩 천둥구름",
  "212":"🌩 강한 천둥구름",
  "221":"🌩 불규칙적 천둥구름",
  "230":"🌩 약한 연무를 동반한 천둥구름",
  "231":"🌩 연무를 동반한 천둥구름",
  "232":"🌧 강한 안개비를 동반한 천둥구름",
  "300":"🌧 가벼운 안개비가 내려요",
  "301":"🌧 안개비가 내려요",
  "302":"🌧 강한 안개비가 내려요",
  "310":"🌧 가벼운 적은비가 내려요",
  "311":"🌧 적은비가 내려요",
  "312":"🌧 강한 적은비가 내려요",
  "313":"🌧 소나기와 안개비",
  "314":"🌧 강한 소나기와 안개비",
  "321":"🌧 소나기가 내려요",
  "500":"🌧 약한 비가 내려요",
  "501":"🌧 중간 비가 내려요",
  "502":"🌧 강한 비가 내려요",
  "503":"🌧 매우 강한 비가 내려요",
  "504":"🌧 극심한 비가 내려요",
  "511":"🌧 우박이 떨어져요",
  "520":"🌧 약한 소나기 비가 내려요",
  "521":"🌧 소나기 비가 내려요",
  "522":"🌧 강한 소나기 비가 내려요",
  "531":"🌧 불규칙적 소나기 비가 내려요",
  "600":"❄ 가벼운 눈이 내려요",
  "601":"❄ 눈이 내려요",
  "602":"❄ 강한 눈이 내려요",
  "611":"🌧 진눈깨비가 내려요",
  "612":"🌧 소나기 진눈깨비가 내려요",
  "615":"🌧 약한 비와 눈이 내려요",
  "616":"🌧 비와 눈이 내려요",
  "620":"🌧 약한 소나기 눈이 내려요",
  "621":"🌧 소나기 눈이 내려요",
  "622":"❄ 강한 소나기 눈이 내려요",
  "701":"박무",
  "711":"연기가 있어요",
  "721":"⛅ 연무",
  "731":"모래 먼지가 날려요",
  "741":"안개가 있어요",
  "751":"모래가 날려요",
  "761":"먼지가 있어요",
  "762":"화산재 날려요",
  "771":"돌풍이 있어요",
  "781":"토네이도",
  "800":"☀ 구름 한 점 없는 맑은 하늘입니다.",
  "801":"☁ 약간의 구름이 낀 하늘입니다.",
  "802":"☁ 드문드문 구름이 낀 하늘입니다.",
  "803":"☀ 구름이 거의 없는 하늘입니다.",
  "804":"☁ 구름으로 뒤덮인 흐린 하늘입니다.",
  "900":"토네이도",
  "901":"태풍",
  "902":"허리케인",
  "903":"한랭",
  "904":"♨ 고온",
  "905":"💨 바람이 있어요",
  "906":"우박이 떨어져요",
  "951":"💨 바람이 거의 없어요",
  "952":"💨 약한 바람이 있어요",
  "953":"💨 부드러운 바람이 있어요",
  "954":"💨 중간 세기 바람이 있어요",
  "955":"💨 신선한 바람이 있어요",
  "956":"💨 센 바람이 있어요",
  "957":"💨 돌풍에 가까운 센 바람이 있어요",
  "958":"💨 돌풍이 있어요",
  "959":"💨 심각한 돌풍이 있어요",
  "960":"🌪 폭풍이 발생했어요.",
  "961":"🌪 강한 폭풍이 발생했어요.",
  "962":"🌪 허리케인"
}

const googleNewsUrl = 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko'

try {
  const { WEBHOOKS: rawWEBHOOKS, WEATHER_API_KEY } = process.env
  if (rawWEBHOOKS == null) throw new ReferenceError('❌ Could not find webhook list!')

  const WEBHOOKS = rawWEBHOOKS.trim().split(',')
  const result = []

  (async () => {
    // Parse weather data
    const weatherResponse = await axios.get(`${weatherUrl}?q=${config.cityName}&appid=${WEATHER_API_KEY}&units=metric`)
    const weatherRawData = weatherResponse.data
    const { weather, main: temperature} = weatherRawData

    result.push({
      weather: (<any> weatherMatchData)[weather[0].id],
      temperature: `(최소 ${temperature.temp_min}도 ~ ${temperature.temp_max}도)`
    })
    console.log('✅ Parsed weather data successfully.')

    // Parse google news data
    const newsResponse = await axios.get(googleNewsUrl)
    const newsRawData = String(newsResponse.data)
    const $ = cheerio.load(newsRawData, { xmlMode: true })

    const titles: string[] = $('item > title').map((_, element) => $(element).text()).get()
    const links: string[] = $('item > link').map((_, element) => $(element).text()).get()
    let content = ''

    for (let i = 0; i < 3; i++) {
      content += `[${titles[i]}](${links[i]})\n`
    }

    result.push(content)
    console.log('✅ Parsed google news data successfully.')
  })()

  WEBHOOKS.map(async hookUrl => {
    const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }).split(/.?\s/).map(s => s.padStart(2, 0))

    if (hookUrl.includes('discordapp.com')) {
      const message: any = {
        username: '부관',
        avatar_url: 'https://i.imgur.com/diJEYhI.jpg',
        embeds: []
      }

      message.embeds.push({
        color: 7506394,
        description: `좋은 아침입니다, 사령관님. ${today[0]}년 ${today[1]}월 ${today[2].slice(0, -1)}일 보고입니다.`,
        fields: [{
          name: '🏞️ 날씨 / 목포',
          value: result[0].weather,
          inline: true
        }, {
          name: '🌡 온도 / 목포',
          value: result[0].temperature,
          inline: true
        }, {
          name: '📰 뉴스 / 구글',
          value: result[1]
        }]
      })
      
      await axios.post(hookUrl, message)
    }
  })
} catch (Error) {
  console.error(Error)
  core.setFailed(Error)
}
