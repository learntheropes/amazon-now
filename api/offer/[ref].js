import puppeteer from 'puppeteer-core'
import dotenv from 'dotenv'
dotenv.config()
var cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET
});

module.exports = async (req,res) => {

  try {
    const { ref, token } = req.query

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_KEY}`
    })
    const page = await browser.newPage()

    await page.setExtraHTTPHeaders({ 'Authorization': `Bearer ${token}` })

    await page.goto(`${process.env.BASEURL}/offer/?ref=${ref}`, {
      waitUntil: 'networkidle0',
    })
    const data = await page.pdf()
    await page.close()
    await browser.close()

    function uploadScreenshot(screenshot) {
      return new Promise((resolve, reject) => {
        const uploadOptions = {
          upload_preset: 'unsigned_preset_default',
          public_id: `${ref}`,
          tags: 'pdf, offer'
        };
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error)
          else resolve(result);
        }).end(screenshot);
      });
    }
    await uploadScreenshot(data)

    res.json({ status: 'ok' })
  } catch (error) {
    console.log(error)
  }
}