const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({

/**
 * 页面的初始数据
 */
data: {
nextWeekWeather: []
},

/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (options) {
this.getWeekForcast()
},
onPullDownRefresh() {
    this.getWeekForcast(() => {
        wx.stopPullDownRefresh()
    })
},
getWeekForcast(callback) {
    let date = new Date()
    wx.request({
          url: 'https://test-miniprogram.com/api/weather/future',
          data: {
              time: date,
              city: '广州市'
          },
          success: res => {
              let result = res.data.result
              let nextWeekWeather = []
              for (let i = 0; i < 7; i++) {
                  nextWeekWeather.push({
                      day: dayMap[date.getDay()],
                      date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                      minTemp: result[i].minTemp + '°',
                      maxTemp: result[i].maxTemp + '°',
                      weatherIcon: '/images/' + result[i].weather + '-icon.png'
                  })
                  date.setDate(date.getDate() + 1)
              }          
              nextWeekWeather[0].day = '今天'
              this.setData({
                  nextWeekWeather
              })
        },
        complete: () => {
            callback && callback()
        }
    })
  }
})