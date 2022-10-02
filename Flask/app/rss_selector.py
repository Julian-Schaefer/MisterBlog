from typing import List, Tuple
import feedparser
import app.html_utils as html_utils
from datetime import datetime
from time import mktime
from app.blog_selection import BlogSelection
from bs4 import BeautifulSoup
import unicodedata

from app.models import BlogPost


def get_rss_url(blog_url: str) -> Tuple[str, bool]:
    page_soup = html_utils.get_soup_from_url(blog_url)
    html_content = str(page_soup)
    normalized_html_content = unicodedata.normalize("NFKD", html_content)
    rss_urls = [rss_link['href'] for rss_link in page_soup.find_all(
        'link', {'type': 'application/rss+xml'})]

    if not rss_urls or len(rss_urls) == 0:
        # Methode 1: Find Article Selector aufwändig in HTML
        return None

    valid_rss_url: str = None
    for rss_url in rss_urls:
        rss_feed = feedparser.parse(rss_url)
        if rss_feed and rss_feed['entries'] and len(rss_feed['entries']) > 0:
            number_of_contained_entries = [
                entry for entry in rss_feed['entries'] if entry['title'] in normalized_html_content]
            if len(number_of_contained_entries) > 1:
                valid_rss_url = rss_url

    if not valid_rss_url:
        return None

    pages = ["paged", "page"]

    for page in pages:
        first_page = feedparser.parse(f'{valid_rss_url}?{page}=1')

        if not first_page or not first_page['entries'] or len(first_page['entries']) == 0:
            break

        second_page = feedparser.parse(f'{valid_rss_url}?{page}=2')

        if not second_page or not second_page['entries'] or len(second_page['entries']) == 0:
            break

        if first_page['entries'][0]['title'] != second_page['entries'][0]['title']:
            # Methode 2: Only RSS can be used, fuck yeah!!!! --> schreibe "rss_url" in DB und benutze zum holen von Articles
            paginated = True
            return (valid_rss_url, paginated)
        else:
            # Methode 3: Find Article Selector nicht so aufwändig in HTML using titles of first RSS Page
            paginated = False
            return (valid_rss_url, paginated)

    # Methode 1: Find Article Selector aufwändig in HTML
    return None
