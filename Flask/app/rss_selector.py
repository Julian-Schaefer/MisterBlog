from typing import List, Tuple
import feedparser
import app.html_utils as html_utils
from newspaper import Article
from datetime import datetime
from time import mktime
from app.blog_selection import BlogSelection
from bs4 import BeautifulSoup


def get_articles_from_rss_url(blog_selection: BlogSelection, page: int) -> List[Article]:
    articles = []
    rss_feed = feedparser.parse(f'{blog_selection.rss_url}?paged={page}')

    for entry in rss_feed['entries']:
        article = Article(entry['link'], title=entry['title'])
        article.blog_url = blog_selection.blog_url
        article.publish_date = datetime.fromtimestamp(
            mktime(entry['published_parsed']))
        article.authors = [author['name'] for author in entry['authors']]
        article.summary = BeautifulSoup(entry['summary'], "lxml").text
        for content_entry in entry['content']:
            if content_entry['type'] == "text/html":
                article.article_html = content_entry['value']
            else:
                article.article_html = 'No HTML content was found :('

        articles.append(article)

    return articles


def get_rss_url(blog_url: str) -> Tuple[str, bool]:
    page_soup = html_utils.get_soup_from_url(blog_url)
    rss_urls = [rss_link['href'] for rss_link in page_soup.find_all(
        'link', {'type': 'application/rss+xml'})]

    if not rss_urls or len(rss_urls) == 0:
        # Methode 1: Find Article Selector aufwändig in HTML
        return None

    valid_rss_url: str = None
    for rss_url in rss_urls:
        rss_feed = feedparser.parse(f'{rss_url}?paged=1')
        if rss_feed and rss_feed['entries'] and len(rss_feed['entries']) > 0:
            if page_soup.findAll(text=rss_feed['entries'][0]['title']):
                valid_rss_url = rss_url

    if not valid_rss_url:
        return None

    first_page = feedparser.parse(f'{valid_rss_url}?paged=1')

    if not first_page or not first_page['entries'] or len(first_page['entries']) == 0:
        # Methode 1: Find Article Selector aufwändig in HTML
        return None

    second_page = feedparser.parse(f'{valid_rss_url}?paged=2')

    if not second_page or not second_page['entries'] or len(second_page['entries']) == 0:
        # Methode 1: Find Article Selector aufwändig in HTML
        return None

    if first_page['entries'][0]['title'] != second_page['entries'][0]['title']:
        # Methode 2: Only RSS can be used, fuck yeah!!!! --> schreibe "rss_url" in DB und benutze zum holen von Articles
        paginated = True
    else:
        # Methode 3: Find Article Selector nicht so aufwändig in HTML using titles of first RSS Page
        paginated = False

    return (valid_rss_url, paginated)
