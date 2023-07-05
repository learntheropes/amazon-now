
import { blockRequests } from './blockRequests'

export const getPricing = async (page) => {
  try {
  
    await blockRequests(page, [
      'cloudfront.net',
      'krxd.net',
      'amazon-adsystem.com',
      'google.com'
    ])
      
    const getNum = (text) => parseFloat(text.match(/\d*\,*\d+\.\d*/))
    await page.exposeFunction('getNum', getNum);
  
    const rows = await page.$$('div[role="row"].olpOffer')
  
    let prices = []
  
    for (const row of rows) {

      const row_info = await getRow(row)
      prices.push(row_info)
    }
  
    return {
      prices
    }

  } catch (error) {

    console.error('Error at amazon.pricing.readAttributes()', error)
  }
}

const getRow = async (row) => {
  try {

    const product = await row.$eval('span.olpOfferPrice', selector => getNum(selector.innerText)).catch(() => 0)

    const shipping = await row.$eval('span.olpShippingPrice', selector => getNum(selector.innerText)).catch(() => 0)

    const tax = await row.$eval('span.olpEstimatedTaxText', selector => getNum(selector.innerText)).catch(() => 0)

    const isPrime = await row.$eval('i.a-icon-prime', () => true).catch(() => false)

    const isFBA = await row.$eval('div.olpBadge', () => true).catch(() => false)

    const isAmazon = await row.$eval('h3.olpSellerName > img', selector => (selector.alt === 'Amazon.com') ? true : false).catch(() => false)
    
    const shopName = (isAmazon)
    ? await row.$eval('h3.olpSellerName > img', selector => selector.alt)
    : await row.$eval('h3.olpSellerName', selector => selector.innerText) 
    
    return {
      product,
      shipping,
      tax,
      isPrime,
      isFBA,
      isAmazon,
      shopName
    }
  } catch (error) {

    console.error('Error at amazon.pricing.readRow()', error)
  }
}
