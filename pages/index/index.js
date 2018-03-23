//index.js
//获取应用实例
const app = getApp()

const weatherMap = {
    "sunny": "晴天",
    "cloudy": "多云",
    "overcast": "阴天",
    "lightrain": "小雨",
    "heavyrain": "大雨",
    "snow": "雪",
}
const weatherColorMap = {
    'sunny': '#cdeefd',
    'cloudy': '#deeef6',
    'overcast': '#c6ced2',
    'lightrain': '#bdd5e1',
    'heavyrain': '#c5ccd0',
    'snow': '#aae1fc'
}

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

Page({
    data: {
      nowTemp: '',
      nowWeatherText: '',
      nowWeatherBackground: '',
      todayDate: '',
      todayMinTemp: '',
      todayMaxTemp: '',
      city: '广州市',
      forecast: [],
      locationAuthType: 0, // 0 - 未授权，未弹过授权框，1 - 未授权，已弹过授权框，2 - 已授权
    },
    onLoad() {
      this.qqmapsdk = new QQMapWX({
        key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
      })
      this.getLocationAuth()
      this.getNow()
    },
    onShow() {
      this.getLocationAuth()
    },
    onPullDownRefresh() {
        this.getNow(() => {
            wx.stopPullDownRefresh()
        })
    },
    getLocationAuth() {
      wx.getSetting({
        success: ({ authSetting }) => {
          let auth = authSetting['scope.userLocation']
          this.setData({
            locationAuthType: auth ? 2 : auth === false ? 1 : 0
          })
          if (auth) this.getLocation() // 已经授权，刷新位置
        }
      })
    },
    getNow(callback) {
        wx.request({
            url: 'https://test-miniprogram.com/api/weather/now',
            data: {
                city: '广州'
            },
            success: res => {
                let result = res.data.result
                let nowTemp = result.now.temp + '°'
                let nowWeather = result.now.weather
                let nowWeatherText = weatherMap[nowWeather]
                let nowWeatherBackground = '/images/' + nowWeather + '-bg.png'
                let date = new Date()
                this.setData({
                    nowTemp,
                    nowWeatherText,
                    nowWeatherBackground,
                    todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                    todayMinTemp: result.today.minTemp + '°',
                    todayMaxTemp: result.today.maxTemp + '°'
                })
                wx.setNavigationBarColor({
                    frontColor: '#000000',
                    backgroundColor: weatherColorMap[nowWeather],
                })

                this.setForecast(result.forecast)
            },
            complete: () => {
                callback && callback()
            }
        })
    },
    setForecast(hourlyWeather) {
        let nowHour = (new Date()).getHours()
        let forecast = []
        for (let i = 0; i < 24; i += 3) {
            forecast.push({
                time: (i + nowHour) % 24 + '时',
                weatherIcon: '/images/' + hourlyWeather[i / 3].weather + '-icon.png',
                temp: hourlyWeather[i / 3].temp + '°'
            })
        }
        forecast[0].time = '现在'
        this.setData({
            forecast
        })
    },
    onTapDayWeather() {
        wx.navigateTo({
          url: `/pages/list/list`,
        })
    },
    onTapLocation() {
      if (this.data.locationAuthType === 1) {
        wx.openSetting()
      } else {
        this.getLocation()
      }
    },
    getLocation() {
      wx.getLocation({
        type: 'gcj02',
        success: ({ latitude, longitude }) => {
          this.setData({
            locationAuthType: 2
          })
          this.qqmapsdk.reverseGeocoder({
            location: {
              latitude,
              longitude
            },
            success: res => {
              let myResult = res.result
              let city = myResult.address_component.city || myResult.ad_info.city
              let isCityChange = city !== this.data.city
              this.setData({
                city
              })
              if (isCityChange) {
                this.getNow()
              }
            },
          })
        },
        fail: () => {
          this.setData({
            locationAuthType: 1
          })
        }
      })
    }
})
