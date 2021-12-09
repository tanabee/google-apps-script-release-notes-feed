const URL = 'https://developers.google.com/apps-script/releases'
const CACHE_KEY = 'rss'

const getFeed = () => {
  const cache = CacheService.getScriptCache()
  const cached = cache.get(CACHE_KEY)
  if (cached) {
    return cached
  }

  const content = UrlFetchApp.fetch(URL).getContentText()
  const $ = Cheerio.load(content)
  const items = []
  $('h3').each((i, elem) => {
    const _date = $(elem).attr('data-text')
    if (_date) {
      const id = $(elem).attr('id')
      const link = `${URL}#${id}`
      const title = $(elem).next().text().split('\n').join()
      const date =
        Utilities.formatDate(new Date(_date), 'GMT', 'E, dd MMM YYYY') +
        ' 00:00:00 GMT'
      items.push({ link, date, title })
    }
  })
  const template = HtmlService.createTemplateFromFile('rss')
  template.items = items
  const feed = template.evaluate().getContent()
  cache.put(CACHE_KEY, feed, 60 * 60)
  return feed
}

const doGet = () => {
  return ContentService.createTextOutput(getFeed()).setMimeType(
    ContentService.MimeType.RSS
  )
}
