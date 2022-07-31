import feedparser
import app.html_utils as html_utils

page_soup = html_utils.get_soup_from_url('https://waldo.be')
rss_urls = [rss_link['href'] for rss_link in page_soup.find_all(
    'link', {'type': 'application/rss+xml'})]

if not rss_urls or len(rss_urls):
    # Methode 1: Find Article Selector aufwändig in HTML
    pass

for rss_url in rss_urls:
    rss_feed = feedparser.parse(f'{rss_url}?paged=1')
    if rss_feed and rss_feed['entries'] and len(rss_feed['entries']) > 0:
        if page_soup.findAll(text=rss_feed['entries'][0]['title']):
            valid_rss_url = rss_url

first_page = feedparser.parse(f'{valid_rss_url}?paged=1')

if not first_page or not first_page['entries'] or len(first_page['entries']) == 0:
    # Methode 1: Find Article Selector aufwändig in HTML
    raise 'asd'


second_page = feedparser.parse(f'{valid_rss_url}?paged=2')


if not second_page or not second_page['entries'] or len(second_page['entries']) == 0:
    # Methode 1: Find Article Selector aufwändig in HTML
    raise 'asd2'

if first_page['entries'][0]['title'] != second_page['entries'][0]['title']:
    # Methode 2: Only RSS can be used, fuck yeah!!!! --> schreibe "rss_url" in DB und benutze zum holen von Articles
    paginated = True
else:
    # Methode 3: Find Article Selector nicht so aufwändig in HTML using titles of first RSS Page
    paginated = False
