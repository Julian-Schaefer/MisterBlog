from datetime import datetime
import logging
from multiprocessing.pool import ThreadPool
from typing import List, Tuple
from readabilipy import simple_json_from_html_string
from readabilipy.extractors.extract_date import extract_date
import trafilatura
#from trafilatura.metadata import extract_metadata
import feedparser
#from newspaper import Article
#from newspaper.extractors import ContentExtractor
#from newspaper.configuration import Configuration

import app.html_utils as html_utils
from app.models import BlogPost
from app.blog_selection import BlogSelection


def download_blog_posts(latest_date: datetime, blog_selections: List[BlogSelection]) -> List[BlogPost]:
    blog_posts: List[BlogPost] = []
    if len(blog_selections) > 0:
        page = 1

        while True:
            urlPool = ThreadPool(len(blog_selections))
            candidate_blog_post_urls: List[Tuple[BlogSelection, List[str]]] = urlPool.starmap(
                get_article_urls, [(page, blog_selection) for blog_selection in blog_selections])
            urlPool.close()
            urlPool.join()

            blog_post_urls: List[Tuple[BlogSelection, List[str]]] = []

            for (blog_selection, urls) in candidate_blog_post_urls:
                last_blog_post = download_article(urls[-1])
                if last_blog_post and last_blog_post.date and (not latest_date or last_blog_post.date < latest_date):
                    blog_post_urls += [(blog_selection, urls)]

            if len(blog_post_urls) > 0:
                downloadPool = ThreadPool(len(blog_post_urls))

                for (blog_selection, urls) in blog_post_urls:
                    current_blog_posts: List[BlogPost] = downloadPool.map(
                        download_article, urls)

                    for blog_post in current_blog_posts:
                        if blog_post and blog_post.date and (not latest_date or blog_post.date < latest_date):
                            blog_post.blog_url = blog_selection.blog_url
                            blog_posts += [blog_post]

                downloadPool.close()
                downloadPool.join()

            if len(blog_posts) > 10:
                blog_posts.sort(
                    key=lambda blog_post: blog_post.date, reverse=True)
                blog_posts = blog_posts[:10]
                break
            else:
                page += 1

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
                if href not in article_urls:
                    article_urls += [href]
    else:
        if page > 1:
            rss_feed = feedparser.parse(
                f'{blog_selection.rss_url}?paged={page}')
        else:
            rss_feed = feedparser.parse(f'{blog_selection.rss_url}')

        for entry in rss_feed['entries']:
            article_urls += [entry['link']]

    return (blog_selection, article_urls)


def _download_article_html(url: str) -> str:
    soup = html_utils.get_soup_from_url(url)
    img_tags = soup.find_all('img')
    for img in img_tags:
        sources = ["src", "srcset", "data-lazy-src"]
        for source in sources:
            if img.has_attr(source) and "base64" in img[source]:
                img[source] = None

    return str(soup)


def download_article(url: str) -> BlogPost:
    try:
        html_doc = _download_article_html(url)

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

        # article = Article(url)
        # article.set_html(html_doc)
        # article.parse()

        # article = Article(url, language=article.meta_lang)
        # article.set_html(blogPost.content)
        # article.set_title(blogPost.title)
        # article.parse()
        # article.nlp()

        # blogPost.summary = article.summary

        #metadata = extract_metadata(html_doc)
        trafilatura_doc = trafilatura.bare_extraction(html_doc, include_formatting=False, output_format='xml',
                                                      include_images=False, include_links=False, include_tables=False, include_comments=False)
        if not blogPost.date and trafilatura_doc['date']:
            blogPost.date = datetime.strptime(
                trafilatura_doc['date'], '%Y-%m-%d')

        blogPost.summary = " ".join(
            trafilatura_doc['raw_text'].split(" ")[:100]) + "..."

        if trafilatura_doc['author']:
            blogPost.authors = trafilatura_doc['author'].split("; ")

        if not simple_article['plain_text'] or len(simple_article['plain_text']) == 0:
            blogPost.content = trafilatura_doc['raw_text']

        return blogPost
    except Exception as e:
        logging.info('Could not download Article', exc_info=True)
        return None
