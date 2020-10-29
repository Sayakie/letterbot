//- Configuration scope
type configType = {
  embedColor: number
}

const config: configType = {
  embedColor: 4416480
}

//- Source code
//- Do not touch below lines
import * as core from '@actions/core'
import axios from 'axios'
import cheerio from 'cheerio'

process.on('uncaughtException', (error: any) => {
  throw new Error(`Uncaught exception occured! Details in: ${error.stack || error}`)
})
process.on('unhandledRejection', (error: any) => {
  throw new Error(`Unhandled rejection occured! Details in: ${error.stack || error}`)
})

// function escapeString(text: string) {
//   return text.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, '\\$&')
// }

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

const cheerioOptions = {
  xmlMode: true
}

const googleNewsUrl = 'https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko'
const velogTrendUrl = 'https://velog.io/'


;(async () => {
  try {
    const { WEBHOOKS: rawWEBHOOKS, WEATHER_API_KEY } = process.env
    if (rawWEBHOOKS == null) throw new ReferenceError('❌ Could not find webhook list!')

    const WEBHOOKS = rawWEBHOOKS.trim().split(',')
    const result: any[] = []
    let content = ''

    // Parse weather data
    const weatherMokpoResponse = await axios.get(`${weatherUrl}?q=Mokpo&appid=${WEATHER_API_KEY}&units=metric`)
    const weatherMokpoRawData = weatherMokpoResponse.data
    const { weather: mokpoWeather, main: mokpoTemperature} = weatherMokpoRawData
    const weatherUlsanResponse = await axios.get(`${weatherUrl}?q=Ulsan&appid=${WEATHER_API_KEY}&units=metric`)
    const weatherUlsanRawData = weatherUlsanResponse.data
    const { weather: ulsanWeather, main: ulsanTemperature} = weatherUlsanRawData

    result.push({
      weather: (<any> weatherMatchData)[mokpoWeather[0].id],
      temperature: `(최소 ${mokpoTemperature.temp_min}도 ~ 최대 ${mokpoTemperature.temp_max}도)`
    })
    result.push({
      weather: (<any> weatherMatchData)[ulsanWeather[0].id],
      temperature: `(최소 ${ulsanTemperature.temp_min}도 ~ 최대 ${ulsanTemperature.temp_max}도)`
    })
    console.log('✅ Parsed weather data successfully.')

    // Parse google news data
    const newsResponse = await axios.get(googleNewsUrl)
    const newsRawData = String(newsResponse.data)
    const $news = cheerio.load(newsRawData, cheerioOptions)

    const newsTitles: string[] = $news('item > title').map((_, element) => $news(element).text()).get()
    const newsLinks: string[] = $news('item > link').map((_, element) => $news(element).text()).get()

    content = ''
    for (let i = 0; i < 3; i++) {
      content += `[${newsTitles[i]}](${newsLinks[i]})\n`
    }

    result.push(content)
    console.log('✅ Parsed google news data successfully.')

    // Parse velog trending top 5 posts
    const velogTrendResponse = await axios.get(velogTrendUrl)
    const velogRawData = String(velogTrendResponse.data)
    const $velog = cheerio.load(velogRawData, cheerioOptions)

    const velogPosts = $velog('h4')
    const velogTitles: string[] = velogPosts.map((_, element) => $velog(element).text()).get()
    const velogLinks: string[] = velogPosts.map((_, element) => $velog(element).parent().attr('href')).get()

    content = ''
    for (let i = 0; i < 5; i++) {
      content += `[${velogTitles[i]}](https://velog.io${velogLinks[i]})\n`
    }

    result.push(content)
    console.log(`✅ Parsed velog trending top 5 posts data successfully.`)

    WEBHOOKS.map(async (hookUrl: string) => {
      const rawToday = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
      const today = rawToday.split('/').map((s: string) => s.padStart(2, '0'))

      const branchMessage = (mokpoWeather[0].id == 800 || ulsanWeather[0].id == 800) ? '날씨가 좋은 관계로' : '날씨가 그리 좋지 않지만'
      const branchPXUsedTime = ~~(Math.random() * 4) + 12
      const branchPXUsedOutTime = branchPXUsedTime + 2
      const fortuneSmile = ~~(Math.random() * 10) + 1
      let fortuneSmileMessage: string
      
      switch (fortuneSmile) {
        case 7:
          fortuneSmileMessage = '\n\n그리고 대대장님 지시 사항으로 전 병력 두발 정리\n단정하게 하도록 지시하셨으니까 오늘 내로\n두발 정리 실시하고 완료된 생활관은 분대장이\n행정반에 와서 보고할 수 있도록 한다.'
          break
        case 8:
          fortuneSmileMessage = '\n\n그리고 다음 주에 사격 훈련이 있는 관계로\n금일 일석 점호는 총기 점호를 실시하겠다.'
          break
        case 9:
          fortuneSmileMessage = '\n\n금일 당직사관이 돌아다니면서 검사할거니까\n한 사람도 빠짐없이 할 수 있도록. 안 한 생활관 있으면\n그 생활관은 휴식군기 미비로 개인정비 없다.'
          break
        case 10:
          fortuneSmileMessage = `\n\n금일 출타 인원이랑 없는 인원들이 많이 있으니까 옆 사람이 대신해주고\n${Boolean(!!~~(Math.random() * 2)) ? '점심' : '저녁'} 먹고 일광건조한거 원위치시키고 개인정비 하도록 한다.`
          break
        default:
          fortuneSmileMessage = '\n\n아울러 전 생활관 선임 분대장들은 지금 즉시 총기함키 수령해갈 수 있도록.'
          break
      }

      if (hookUrl.includes('discordapp.com')) {
        const message: any = {
          username: '당직사관,
          // avatar_url: 'https://i.imgur.com/diJEYhI.jpg', // 테란 부관
          // avatar_url: 'https://i.imgur.com/m1zwJWY.jpg', // 저그 감염된 부관
          // avatar_url: 'https://i.imgur.com/UrRo8HN.jpg', // 프로토스 집행관
          // avatar_url: 'https://i.imgur.com/KsNkmTB.jpg', // 멍뭉이
          // avatar_url: 'https://i.imgur.com/cg7cEQj.png', // 콧코로
          avatar_url: 'https://i.imgur.com/1LihyUl_d.webp?maxwidth=728&fidelity=grand',
          embeds: []
        }

        // console.log(JSON.stringify(result, null, 2))
        message.embeds.push({
          color: config.embedColor,
          description: `후━─후... 아─ 아──. 행정반에서 당직 사관이 전파한다.\n${today[2]}년 ${today[0]}월 ${today[1]}일 현재시각 공팔시 정각.\n금일 ${branchMessage} ${branchPXUsedTime}시부터 ${branchPXUsedOutTime}시까지\nPX 및 싸지방 이용, TV 시청 중지하고 전 병력 담당 구역 청소 및\n침구류 일광 소독을 실시할 수 있도록 한다.${fortuneSmileMessage}\n이상 전달 끝.`,
          fields: [{
            name: `🏞️ 날씨 / 목포`,
            value: result[0].weather,
            inline: true
          }, {
            name: `🌡 온도 / 목포`,
            value: result[0].temperature,
            inline: true
          }, {
            name: '‎',
            value: '‎',
            inline: true
          }, {
            name: `🏞️ 날씨 / 울산`,
            value: result[1].weather,
            inline: true
          }, {
            name: `🌡 온도 / 울산`,
            value: result[1].temperature,
            inline: true
          }, {
            name: '‎',
            value: '‎',
            inline: true
          }, {
            name: '‎',
            value: '‎',
            inline: true
          }, {
            name: '‎',
            value: '‎',
            inline: true
          }, {
            name: '‎',
            value: '‎',
            inline: true
          }, {
            name: '📰 뉴스 / 구글',
            value: result[2]
          }, {
            name: '📰 트렌드 포스트 / 벨로그',
            value: result[3]
          }]
        })
      
        await axios.post(hookUrl, message)
      }
    })
  } catch (Error) {
    console.error(Error)
    core.setFailed(Error)
  }
})()
