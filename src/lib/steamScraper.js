/* eslint @typescript-eslint/no-var-requires: "off" */
const cheerio = require('cheerio')
const request = require('request')
var $ = require('jquery')
const lang = 'french'

var url = 'https://store.steampowered.com/app/'

function getData (appId, cb) {
  request({
    uri: url + appId,
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

        var obj = {
          categories: [],
          tags: []
        }

        $('.game_area_details_specs .name').each(function () {
          obj.categories.push($(this).text())
        })

        $('.popular_tags .app_tag').each(function () {
          if ($(this).text().trim() !== '+') {
            obj.tags.push($(this).text().trim())
          }
        })

        // var details = $('.block_content_inner .details_block').first().html().split('<br>');

        // for (let line of details) {
        //   //Replace tags
        //   line = line.replace(/<[^<]+?>/g, '');

        //   //Replace whitespace, tabs, etc
        //   line = line.replace(/[\r\t\n]/g, '');

        //   if (line) {
        //     for (let i = 0; i < props.length; i++) {
        //       if (line.includes(props[i])) {
        //         var detail = line.replace(props[i], '').trim();

        //         //Genre split on commas
        //         if (i === 1) {
        //           //Split and trim each genre
        //           obj[names[i]] = detail.split(',').map(s => s.trim());
        //         } else {
        //           obj[names[i]] = detail;
        //         }
        //       }
        //     }
        //   }
        // }

        obj.app_name = $('.apphub_AppName').first().text().trim()
        if ($('.game_page_autocollapse_ctn').length) {
          obj.description = {
            sectionOne: $('.game_area_description').first().html(),
            sectionTwo: $('.game_page_autocollapse_ctn').html()
          }
        } else {
          obj.description = $('.game_area_description').first().html()
        }
        if ($('.highlight_player_item').length) {
          obj.video = $('.highlight_player_item').attr('data-mp4-hd-source')
        } else {
          obj.video = ''
        }
        obj.cover = $('.game_header_image_full').first().attr('src')
        obj.background = $('.game_page_background').first().attr('style')
        var price = $('.game_purchase_price').first().text().trim()

        if (!price) {
          price = $('.discount_original_price').first().text().trim()
          obj.discount_price = $('.discount_final_price').first().text().trim()
        }

        obj.price = price

        if ($('.early_access_header').length > 0) {
          obj.early_access = true
        } else {
          obj.early_access = false
        }

        if ($('#game_area_metascore .score').length > 0) {
          obj.metascore = $('#game_area_metascore .score').first().text().trim()
        }

        $('.summary .game_review_summary').each(function () {
          if ($(this).prop('itemprop')) {
            obj.sentiment = $(this).text().trim()

            // Get number of reviews
            obj.num_reviews = $(this).parent().find('.responsive_hidden').eq(0).text().trim().slice(1, -1)
          }
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
