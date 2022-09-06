from datetime import datetime
import logging
from multiprocessing.pool import ThreadPool
from typing import List
from readabilipy import simple_json_from_html_string
from readabilipy.extractors.extract_date import extract_date
import requests
import dateparser
import pytz
import trafilatura
from urllib.parse import urldefrag
import feedparser

import app.html_utils as html_utils
from app.models import BlogPost
from app.blog_selection import BlogSelection


def download_blog_posts(page: int, blog_selections: List[BlogSelection]) -> List[BlogPost]:
    blog_posts: List[BlogPost] = []
    pool = ThreadPool(blog_selections.count())
    blog_post_urls = pool.starmap(
        get_article_urls, [(page, blog_selection) for blog_selection in blog_selections])
    pool.close()
    pool.join()

    if len(blog_post_urls) > 0:
        pool = ThreadPool(len(blog_post_urls))
        for (blog_selection, urls) in blog_post_urls:
            current_blog_posts: List[BlogPost] = pool.map(
                download_article, urls)
            for blog_post in current_blog_posts:
                blog_post.blog_url = blog_selection.blog_url
                blog_posts.append(blog_post)

        pool.close()
        pool.join()

    return blog_posts


def get_article_urls(page, blog_selection):
    article_urls = []
    if not blog_selection.rss_url:
        article_selectors = blog_selection.article_selectors
        page_counter_url = blog_selection.page_counter_url

        if page > 1:
            blog_page_url = page_counter_url.replace(
                "{page-counter}", str(page))
        else:
            blog_page_url = blog_selection.blog_url

        page_soup = html_utils.get_soup_from_url(blog_page_url)

        for article_selector in article_selectors:
            links_on_page = page_soup.select(
                html_utils.selector_path_to_string(article_selector), href=True)

            for link_on_page in links_on_page:
                href = html_utils.get_href_from_link(
                    blog_selection.blog_url, link_on_page)
                href = urldefrag(href)[0]
                if href not in article_urls:
                    article_urls += [href]
    else:
        rss_feed = feedparser.parse(f'{blog_selection.rss_url}?paged={page}')

        for entry in rss_feed['entries']:
            article_urls += [entry['link']]

    return (blog_selection, article_urls)


def download_article(url: str) -> BlogPost:
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        html_doc = requests.get(url, headers=headers).text

        simple_article = simple_json_from_html_string(
            html_doc, use_readability=True)

        blogPost = BlogPost(
            title=simple_article['title'],
            date=extract_date(html_doc),
            summary=None,
            content=simple_article['plain_content'],
            authors=["N/A"],
            blog_url=None,
            post_url=url
        )

        if blogPost.date:
            blogPost.date = datetime.fromisoformat(blogPost.date)

        trafilatura_doc = trafilatura.bare_extraction(html_doc, include_formatting=False, output_format='xml',
                                                      include_images=False, include_links=False, include_tables=False, include_comments=False)
        if not blogPost.date and trafilatura_doc['date']:
            blogPost.date = datetime.strptime(
                trafilatura_doc['date'], '%Y-%m-%d')

        blogPost.summary = trafilatura_doc['description']
        if trafilatura_doc['author']:
            blogPost.authors = trafilatura_doc['author'].split("; ")

        if not simple_article['plain_text'] or len(simple_article['plain_text']) == 0:
            # or (len(simple_article['plain_text'][0]['text']) > 1
            #    and trafilatura_doc['raw_text'].startswith(simple_article['plain_text'][0]['text']))):
            blogPost.content = trafilatura_doc['raw_text']

        return blogPost
    except Exception as e:
        logging.info('Could not download Article', exc_info=True)
        return None


def _validate_date(publish_date):
    if not publish_date:
        return None

    if isinstance(publish_date, datetime):
        publish_date_datetime = publish_date
    else:
        try:
            if len(publish_date) < 6:
                return None
            publish_date_datetime = dateparser.parse(publish_date)
        except ValueError:
            logging.info('Could not validate date', exc_info=True)
            return None

    return publish_date_datetime.replace(tzinfo=pytz.utc)
