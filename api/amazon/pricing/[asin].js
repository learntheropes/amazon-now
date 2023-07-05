import puppeteer from 'puppeteer-core'
import { stringify } from 'qs'
import dotenv from 'dotenv'
dotenv.config()
import { getPricing } from '../../_amazon/pricing'

module.exports = async (req,res) => {

  try { 

    const { asin } = req.query

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_KEY}`
    })
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
    })

    const querystring = stringify({
      ie: 'UTF8',
      f_all: true,
      f_new: true,
      startIndex: 0
    })
    await page.goto(`https://www.amazon.com/gp/offer-listing/${asin}/ref=olp_page_1?${querystring}`, {timeout: 7000})
    const prices = await getPricing(page)
    await page.close()
    await browser.close()
    res.json(prices)
  } catch (error) {
    console.log(error)
  }
}
