import { blockRequests } from './blockRequests'

export const getAttributes = async (page) => {
  try {

    await blockRequests(page, [
      'cloudfront.net',
      'krxd.net',
      'amazon-adsystem.com',
      'google.com'
    ])
  
    let title, price, categories, weight, brand, image
  
    await Promise.all([
      getTitle(page, 3000).then(res => title = res),
      getPrice(page, 3000).then(res => price = parseFloat(res.replace('$',''))),
      getCategories(page, 3000).then(res => categories = res),
      getWeight(page, 3000).then(res => weight = res),
      getBrand(page, 3000).then(res => brand = res),
      getImage(page, 3000).then(res => image = res)
    ])

    return {
      title,
      price,
      categories,
      weight,
      brand,
      image
    } 

  } catch (error) {
    console.error(error)
  }
}

const getImage = async (page,timeout) => {
  try {
    let promises = []
  
    const selectors = [
      '#imgTagWrapperId > img',
    ]

    const evalFunction = (el) => el.getAttribute('src')

    for (const selector of selectors) {

      const promise = page.waitForSelector(selector, {timeout}).then( async () => {
        return await page.$eval(selector, evalFunction)
      }).catch(() => {
        return null;
      })

      promises.push(promise)
    }
    return await Promise.race(promises)
  } catch (error) {
    console.error('Error at amazon.specification.getImage()', error)
  }
}

const getTitle = async (page,timeout) => {
  try {
    let promises = []
  
    const selectors = [
      '#olpProductDetails > h1',
      'span#productTitle'
    ]

    const evalFunction = (el) => el.innerText

    for (const selector of selectors) {

      const promise = page.waitForSelector(selector, {timeout}).then( async () => {
        return await page.$eval(selector, evalFunction)
      }).catch(() => {
        return null;
      })

      promises.push(promise)
    }
    return await Promise.race(promises)
  } catch (error) {
    console.error('Error at amazon.specification.getTitle()', error)
  }
}

const getPrice = async (page,timeout) => {
  try {
    let promises = []
  
    const selectors = [
      'span#priceblock_ourprice',
    ]

    const evalFunction = (el) => el.innerText

    for (const selector of selectors) {

      const promise = page.waitForSelector(selector, {timeout}).then( async () => {
        return await page.$eval(selector, evalFunction)
      }).catch(() => {
        return null;
      })

      promises.push(promise)
    }
    return await Promise.race(promises)
  } catch (error) {
    console.error('Error at amazon.specification.getTitle()', error)
  }
}

const getBrand = async (page, timeout) => {
  try {

    let promises = []
  
    const selectors = [
      'a#bylineInfo',
    ]

    const evalFunction = (el) => el.innerText

    for (const selector of selectors) {

      const promise = page.waitForSelector(selector, {timeout}).then( async () => {
        return await page.$eval(selector, evalFunction)
      }).catch(() => {
        return null;
      })

      promises.push(promise)
    }
    return await Promise.race(promises);

  } catch (error) {

    console.error('Error at amazon.specification.getBrand()', error)
  }
}

const getCategories = async (page, timeout) => {
  try {

    let promises = []

    const selectors = [
      '#wayfinding-breadcrumbs_feature_div > ul > li:not(.a-breadcrumb-divider)',
      '#wayfinding-breadcrumbs_container > ul > li:not(.a-breadcrumb-divider)'
    ]

    const evalFuncion = (els) => els.map(el => el.innerText)

    for (const selector of selectors) {

      const promise = page.waitForSelector(selector, {timeout}).then( async () => {

        return  await page.$$eval(selector, evalFuncion)
      }).catch((err) => {
        return null;
      })
      promises.push(promise)
    }
    return await Promise.race(promises);

  } catch (error) {

    console.error('Error at amazon.specification.getCategories()', error)
  }
}

const getWeight = async (page, timeout) => {
  try {

    let promises = []
  
    const selectors = [
      'div#detailBullets',
      'div#detail-bullets',
      'table#productDetails_detailBullets_sections1',
      'div#prodDetails',
      // 'div#technicalSpecifications_feature_div',
      'div#detail-bullets_feature_div',
      'table#productDetails_techSpec_section_1',
      'table#productDetailsTable'
    ]
  
    const evalFunction = (el) => {
  
      const regex = /(?<=(Shipping\sWeight:*\s*|Item\sWeight:*\s*))\d+\.*\d*(?=(\s*pounds|\sounces))/g;
  
      let matches = Array.from(el.innerText.matchAll(regex));
  
      let weight = (matches.length === 2)
      ? matches.filter(match => {
          return match[1].includes('Shipping')
        }).map(match => {
          const v = parseFloat(match[0])
          const u = (match[2].trim() === 'pounds') ? 0.4535924 : 0.02834952
          return (v * u) + 0.01
        })[0]
      : matches.map(match => {
          const v = parseFloat(match[0])
          const u = (match[2].trim() === 'pounds') ? 0.4535924 : 0.02834952
          return (v * u * 1.05) + 0.01
        })[0];
  
      return parseFloat(weight.toFixed(2));
    }
  
    for (let i = 0; i < selectors.length; i++) {
  
      const promise = page.waitForSelector(selectors[i], {timeout}).then( async () => {
        return await page.$eval(selectors[i], evalFunction)
      }).catch(() => {
        return null;
      })
  
      promises.push(promise)
    }
    return await Promise.race(promises);
  } catch (error) {

    console.error('Error at amazon.specification.getWeight()', error)
  }
}
