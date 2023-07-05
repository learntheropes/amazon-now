export const blockRequests = async (page, urls) => {

  await page.setRequestInterception(true)
  
  page.on('request', (request) => {
    const url = request.url();
    const shouldAbort = urls.some((urlPart) => url.includes(urlPart))
    if (shouldAbort) request.abort()
    else if (request.resourceType() === ('image' || 'stylesheet' || 'font')) request.abort()
    else request.continue();
  })
}