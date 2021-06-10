
const cheerio = require('cheerio')
const request = require('request')
var $ = require('jquery')
const lang = 'french'

var url = 'https://store.steampowered.com/search/?sort_by=Released_DESC&maxprice=free&specials=1'

function getData (cb) {
  request({
    uri: url,
    headers: {
      Cookie: `mature_content=1; birthtime=568022401; Steam_Language=${lang}`
    }
  },
  (err, resp, body) => {
    if (err) {
      console.error(err)

      // Send an error
      cb(err, null)
    } else {
      try {
        // Load the body
        $ = cheerio.load(body)
        const obj = []

        $('a.search_result_row').each(function() {
          obj.push($(this).attr('data-ds-appid'))
        })

        // Return data
        cb(null, obj)
      } catch (err) {
        cb(err, null)
      }
    }
  })
}

module.exports = {
  getData
}
