from datetime import datetime
import requests
from bs4 import BeautifulSoup
import re
from newspaper import Article
from goose3 import Goose
from urllib.parse import urlsplit
import dateparser
import pytz
import tldextract


def bs_preprocess(html):
    pat = re.compile('(^[\s]+)|([\s]+$)', re.MULTILINE)
    # remove leading and trailing whitespaces
    html = re.sub(pat, '', html)
    html = re.sub('\n', ' ', html)     # convert newlines to spaces
    # this preserves newline delimiters
    # remove whitespaces before opening tags
    html = re.sub('[\s]+<', '<', html)
    # remove whitespaces after closing tags
    html = re.sub('>[\s]+', '>', html)
    # remove comments
    html = re.sub("(<!--.*?-->)", "", html, flags=re.DOTALL)
    return html


def get_soup_from_url(url):
    html_doc = requests.get(url).text
    cleaned_html_doc = bs_preprocess(html_doc)
    soup = BeautifulSoup(cleaned_html_doc, 'html.parser')
    return soup


def get_element(node):
    length = len(list(node.previous_siblings)) + 1
    return '%s:nth-child(%s)' % (node.name, length)


def get_css_path(node):
    path = [get_element(node)]
    for parent in node.parents:
        if parent.name == 'body':
            path.insert(0, 'body')
            break
        path.insert(0, get_element(parent))
    return path


def get_page_counter_url(url):
    soup = get_soup_from_url(url)

    possible_links = []
    for link in soup.find_all('a', href=True):
        href = link["href"]
        if "2" in href:
            possible_links += [link]

    for link in possible_links:
        try:
            href = link["href"]
            if href.startswith("/"):
                href = get_root_url(url) + href

            soup = get_soup_from_url(href)

            for new_link in soup.find_all('a', href=True):
                new_href = new_link["href"]
                if new_href.startswith("/"):
                    new_href = get_root_url(url) + new_href

                if new_href == href:
                    continue

                if "3" in new_href:
                    common = longest_common_substring(href, new_href)
                    if common == '' or common[-1] in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]:
                        continue

                    common_end2 = href[len(common+"3"):]
                    common_end3 = new_href[len(common+"2"):]
                    if common_end2 == common_end3:
                        constructed_2 = common + "2" + \
                            new_href[len(common+"2"):]
                        constructed_3 = common + "3" + href[len(common+"3"):]

                        if constructed_2 == href and constructed_3 == new_href:
                            return common + "{page-counter}" + href[len(common+"3"):]
        except:
            continue

    return None


def longest_common_substring(firstString, secondString):
    """ returns the longest common substring from the beginning of firstString and secondString """
    def _iter():
        for a, b in zip(firstString, secondString):
            if a == b:
                yield a
            else:
                return

    common_start = ''.join(_iter())
    return common_start


def get_articles(page, blogSelection):
    article_selectors = blogSelection.article_selectors
    page_counter_url = blogSelection.page_counter_url
    blog_page_url = page_counter_url.replace("{page-counter}", str(page))

    page_soup = get_soup_from_url(blog_page_url)

    article_urls = []
    for article_selector in article_selectors:
        links_on_page = page_soup.select(
            selector_path_to_string(article_selector), href=True)

        root_url = get_root_url(blogSelection.blog_url)
        for link_on_page in links_on_page:
            href = link_on_page["href"]
            if href.startswith("/"):
                href = root_url + href
            if href not in article_urls:
                article_urls += [href]

    return (blogSelection, article_urls)


def get_invalid_article_paths(blog_url, article_paths, page_soup, compare_links):
    invalid_article_paths = []
    for article_path in article_paths:
        links_on_page = page_soup.select(
            selector_path_to_string(article_path), href=True)

        identical_links = 0
        external_links = 0
        domain = get_domain(blog_url)
        for link in links_on_page:
            href = link["href"]
            if not href.startswith("/"):
                if domain not in href:
                    external_links += 1

            for compare_link in compare_links:
                if href == compare_link["href"]:
                    identical_links += 1

        for link in links_on_page:
            for compare_link in compare_links:
                if link["href"] == compare_link["href"]:
                    identical_links += 1

        if identical_links > 1 or external_links > 0:
            invalid_article_paths += [article_path]

    return invalid_article_paths


def get_article_selectors(blog_url):
    page_counter_url = get_page_counter_url(blog_url)
    second_page_url = page_counter_url.replace("{page-counter}", str(2))
    third_page_url = page_counter_url.replace("{page-counter}", str(3))

    first_page_soup = get_soup_from_url(blog_url)
    second_page_soup = get_soup_from_url(second_page_url)
    third_page_soup = get_soup_from_url(third_page_url)

    first_article_paths = get_valid_article_paths(
        blog_url, first_page_soup)
    second_article_paths = get_valid_article_paths(
        second_page_url, second_page_soup)

    all_links_on_third_page = third_page_soup.find_all("a", href=True)

    invalid_article_paths = []
    invalid_article_paths.extend(get_invalid_article_paths(blog_url,
                                                           first_article_paths, first_page_soup, all_links_on_third_page))
    invalid_article_paths.extend(get_invalid_article_paths(blog_url,
                                                           second_article_paths, second_page_soup, all_links_on_third_page))

    total_article_paths = []
    total_article_paths.extend(first_article_paths)
    total_article_paths.extend(second_article_paths)

    final_article_paths = []
    for article_path in total_article_paths:
        if article_path not in invalid_article_paths and article_path not in final_article_paths:
            final_article_paths += [article_path]

    return (final_article_paths, page_counter_url)


def get_article_urls(article_paths, blog_url, page):
    page_url = blog_url
    if page > 1:
        page_counter_url = get_page_counter_url(blog_url)
        page_url = page_counter_url.replace("{page-counter}", str(page))

    soup = get_soup_from_url(page_url)

    urls = []
    for article_path in article_paths:
        links = soup.select(selector_path_to_string(article_path), href=True)
        for link in links:
            href = link["href"]
            if href.startswith("/"):
                href = get_root_url(blog_url) + href

            if href not in urls:
                urls += [href]

    return urls


def get_valid_article_paths(url, soup):
    link_paths = [get_css_path(
        link) for link in soup.select('a', href=True)]

    class Node(object):
        def __init__(self, tag):
            self.tag = tag
            self.children = []

        def add_child(self, obj):
            self.children.append(obj)

    def calc_tree(node, link_path, level):
        def get_element_type(tag):
            if ":nth-child(" not in tag:
                return tag

            return tag[:tag.rindex(":nth-child(")]

        if level >= len(link_path):
            return

        tag = link_path[level]

        existing_child = None
        for child in node.children:
            if child.tag == tag:
                existing_child = child
                break

        if existing_child:
            calc_tree(existing_child, link_path, level+1)
        else:
            existing_type_child = None
            for child in node.children:
                if get_element_type(child.tag) == get_element_type(tag):
                    existing_type_child = child
                    break

            if existing_type_child:
                existing_type_child.tag = get_element_type(tag)
                calc_tree(existing_type_child, link_path, level+1)
            else:
                new_child = Node(tag)
                node.add_child(new_child)
                calc_tree(new_child, link_path, level+1)

    root = Node('body')
    for link_path in link_paths:
        calc_tree(root, link_path, 1)

    def get_paths_from_tree(node, all_paths, current_path=None):
        if not current_path:
            current_path = []

        current_path += [node.tag]

        if len(node.children) == 0:
            all_paths.append(current_path)
        else:
            for child in node.children:
                get_paths_from_tree(child, all_paths, current_path[:])

    article_paths = []
    get_paths_from_tree(root, article_paths)

    article_only_paths = []
    for article_path in article_paths:
        if "article" in article_path:
            article_only_paths += [article_path]

    if len(article_only_paths) > 0:
        article_paths = article_only_paths

    valid_article_paths = []
    for article_path in article_paths:
        links = soup.select(selector_path_to_string(article_path), href=True)
        if links and len(links) > 0:
            firstLink = links[0]
            if firstLink.has_attr("href"):
                href = firstLink["href"]
                if not (href.startswith("http://") or href.startswith("https://")):
                    href = get_root_url(url) + href
                article = download_article(href)
                if article and article.publish_date:
                    valid_article_paths += [article_path]

    return valid_article_paths


def get_domain(url):
    _, td, tsu = tldextract.extract(url)
    domain = td + '.' + tsu
    return domain


def get_root_url(url):
    url_parts = urlsplit(url)
    root_url = url_parts.scheme + "://" + url_parts.netloc
    return root_url


def selector_path_to_string(path):
    return ' > '.join(path)


def find_selector_path(first_path, second_path):
    if len(first_path) != len(second_path) or first_path == second_path:
        return None

    selector_path = []
    for first_selector, second_selector in zip(first_path, second_path):
        if first_selector == "body" and second_selector == "body":
            selector_path += ["body"]
            continue

        if first_selector == second_selector:
            selector_path += [first_selector]
        else:
            first_selector = first_selector[:first_selector.rindex(
                ":nth-child(")]
            second_selector = second_selector[:second_selector.rindex(
                ":nth-child(")]

            if first_selector == second_selector:
                selector_path += [first_selector]
            else:
                return None

    return selector_path


def validate_date(publish_date):
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
            return None

    return publish_date_datetime.replace(tzinfo=pytz.utc)


def download_article(url):
    try:
        article = Article(url, keep_article_html=True)
        article.download()
        article.parse()
        article.nlp()

        if not article.publish_date or not article.authors:
            g = Goose()
            goose_article = g.extract(url=url)

            if len(article.authors) == 0 and len(goose_article.authors) > 0:
                article.authors = goose_article.authors

            if not article.publish_date:
                article.publish_date = goose_article.publish_date

            article.publish_date = validate_date(article.publish_date)

        return article
    except:
        return None
