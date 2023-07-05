// const chromium = require('chrome-aws-lambda');
import puppeteer from 'puppeteer-core'
import dotenv from 'dotenv'
dotenv.config()
import { getAttributes } from '../../_amazon/specifications'

module.exports = async (req,res) => {

  try { 

    const { asin } = req.query

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_KEY}`
    })
    const page = await browser.newPage()
    // await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36')
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8' })
    await page.goto(`https://www.amazon.com/dp/${asin}`, {timeout: 7000})
    const specifications = await getAttributes(page)
    // const title = await page.title()
    await page.close()
    await browser.close()
    res.json({ specifications })
  } catch (error) {
    console.log(error)
  }
}