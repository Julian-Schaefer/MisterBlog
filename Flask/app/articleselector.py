import requests
from bs4 import BeautifulSoup
import re
from newspaper import Article
from goose3 import Goose
from urllib.parse import urlsplit, urlunsplit
import dateparser


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
                    if common[-1] in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]:
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
    article_urls = get_article_urls(blogSelection.blogUrl, page)
    return (blogSelection, article_urls)


def get_article_urls(blogUrl, page):
    page_counter_url = get_page_counter_url(blogUrl)
    if page > 1:
        blogUrl = page_counter_url.replace("{page-counter}", str(page))

    if blogUrl.endswith('/'):
        blogUrl = blogUrl[:-1]

    soup = get_soup_from_url(blogUrl)

    link_paths = [get_css_path(link) for link in soup.select('a')]
    link_paths.sort()

    last_link_path = link_paths[0]
    article_paths = []
    for link_path in link_paths[1:]:
        selector = find_selector_path(last_link_path, link_path)
        if selector:
            elements = soup.select(selector_path_to_string(selector))
            if len(elements) > 5:
                if selector not in article_paths:
                    article_paths += [selector]

        last_link_path = link_path

    valid_article_paths = []
    for article_path in article_paths:
        firstLink = soup.select(selector_path_to_string(article_path))[0]
        url = firstLink["href"]
        if not (url.startswith("http://") or url.startswith("https://")):
            url = get_root_url(blogUrl) + url
        article = download_article(url)
        if article and article.publish_date:
            valid_article_paths += [article_path]

    article_links = [soup.select(selector_path_to_string(
        article_path)) for article_path in valid_article_paths]
    print(valid_article_paths)

    # article_paths = {}
    # previousElements = {}
    # for path in link_paths:
    #     found = False
    #     currentSelector = ""
    #     previousCount = 3

    #     selector = path[0:path.rindex(":nth-child(")]
    #     while True:
    #         try:
    #             if previousElements.get(selector):
    #                 selectedElements = previousElements.get(selector)
    #             else:
    #                 selectedElements = soup.select(selector)
    #                 previousElements[selector] = selectedElements

    #             if len(selectedElements) > previousCount:
    #                 found = True
    #                 currentSelector = selector
    #                 previousCount = len(selectedElements)

    #             selector = selector[0:selector.rindex(":nth-child(")]
    #         except ValueError:
    #             break

    #     if found:
    #         article_path = article_paths.get(currentSelector)
    #         if article_path:
    #             article_paths[currentSelector] = article_path+1
    #         else:
    #             article_paths[currentSelector] = 1

    # article_selector_path = ""
    # for article_path, count in article_paths.items():
    #     if count > 3:
    #         article = soup.select(article_path)[0]
    #         headerElements = article.select("header, h1, h2, h3, h4, h5, h6")

    #         if headerElements:
    #             for headerElement in headerElements:
    #                 linkElement = headerElement.find_all('a', href=True)
    #                 if linkElement:
    #                     css_path = get_css_path(linkElement[0])
    #                     article_selector_path = article_path + \
    #                         css_path[len(article_path)+len("nth-child(x) "):]
    #                     break

    # article_urls = []
    # articles = soup.select(article_selector_path)
    # for article in articles:
    #     link = article["href"]
    #     if not (link.startswith("http://") or link.startswith("https://")):
    #         link = blogUrl + link
    #     article_urls.append(link)

    return article_urls


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
    third_article_paths = get_valid_article_paths(
        third_page_url, third_page_soup)

    identical_article_paths = []
    for second_article_path in second_article_paths:
        for third_article_path in third_article_paths:
            if selector_path_to_string(third_article_path) != selector_path_to_string(second_article_path):
                continue

            link_on_third_page = third_page_soup.select(
                selector_path_to_string(third_article_path), href=True)[0]
            link_on_second_page = second_page_soup.select(
                selector_path_to_string(third_article_path), href=True)[0]
            if link_on_third_page['href'] == link_on_second_page['href']:
                identical_article_paths += [second_article_path]

    total_article_paths = []
    total_article_paths.extend(first_article_paths)
    total_article_paths.extend(second_article_paths)
    total_article_paths.extend(third_article_paths)

    final_article_paths = []
    for article_path in total_article_paths:
        if article_path not in identical_article_paths and article_path not in final_article_paths:
            final_article_paths += [article_path]

    # TODO: Clean up duplicate Paths

    return final_article_paths


def get_valid_article_paths(url, soup):
    link_paths = [get_css_path(link) for link in soup.select('a')]
    link_paths.sort()

    last_link_path = link_paths[0]
    article_paths = []
    for link_path in link_paths[1:]:
        selector = find_selector_path(last_link_path, link_path)
        if selector:
            elements = soup.select(selector_path_to_string(selector))
            if len(elements) > 5:
                if selector not in article_paths:
                    article_paths += [selector]

        last_link_path = link_path

    valid_article_paths = []
    for article_path in article_paths:
        firstLink = soup.select(selector_path_to_string(article_path))[0]
        href = firstLink["href"]
        if not (href.startswith("http://") or href.startswith("https://")):
            href = get_root_url(url) + href
        article = download_article(href)
        if article and article.publish_date:
            valid_article_paths += [article_path]

    return valid_article_paths


def get_root_url(url):
    url_parts = urlsplit(url)
    root_url = url_parts.scheme + "://" + url_parts.netloc
    return root_url


def selector_path_to_string(path):
    return ' > '.join(path)


def find_selector_path(firstPath, secondPath):
    if len(firstPath) != len(secondPath):
        return None

    selectorPath = []
    for firstSelector, secondSelector in zip(firstPath, secondPath):
        if firstSelector == "body" and secondSelector == "body":
            selectorPath += ["body"]
            continue

        if firstSelector == secondSelector:
            selectorPath += [firstSelector]
        else:
            firstSelector = firstSelector[:firstSelector.rindex(":nth-child(")]
            secondSelector = secondSelector[:secondSelector.rindex(
                ":nth-child(")]

            if firstSelector == secondSelector:
                selectorPath += [firstSelector]
            else:
                return None

    return selectorPath


def is_compatible(blogUrl):
    article_selectors = get_article_selectors(blogUrl)
    if len(article_selectors) >= 1:
        return True

    return False


def validate_date(date_text):
    try:
        if len(date_text) < 6:
            return None
        return dateparser.parse(date_text)
    except ValueError:
        return None


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

            validated_date = validate_date(article.publish_date)
            if validate_date:
                article.publish_date = validated_date
            else:
                article.publish_date = None

        return article
    except:
        return None
