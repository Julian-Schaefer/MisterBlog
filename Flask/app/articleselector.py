import requests
from bs4 import BeautifulSoup
import re
from newspaper import Article


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
    return ' > '.join(path)


def get_page_counter_url(url):
    html_doc = requests.get(url).text
    cleaned_html_doc = bs_preprocess(html_doc)

    soup = BeautifulSoup(cleaned_html_doc, 'html.parser')

    for link in soup.find_all('a', href=True):
        href = link["href"]
        matchers = ["?page", "/page", "/2/"]
        for matcher in matchers:
            if matcher in href:
                pre = href[0:href.index(matcher)]
                sub = href[href.index(matcher):]
                sub = sub.replace("2", "{page-counter}", 1)
                return pre + sub


def get_articles(page, blogSelection):
    url = blogSelection.blogUrl
    if page > 1:
        page_counter_url = get_page_counter_url(url)
        url = page_counter_url.replace("{page-counter}", str(page))

    html_doc = requests.get(url).text
    cleaned_html_doc = bs_preprocess(html_doc)

    soup = BeautifulSoup(cleaned_html_doc, 'html.parser')

    link_paths = []
    for link in soup.select('a'):
        link_paths.append(get_css_path(link))

    article_paths = {}
    previousElements = {}
    for path in link_paths:
        found = False
        currentSelector = ""
        previousCount = 3

        selector = path[0:path.rindex(":nth-child(")]
        while True:
            try:
                if previousElements.get(selector):
                    selectedElements = previousElements.get(selector)
                else:
                    selectedElements = soup.select(selector)
                    previousElements[selector] = selectedElements

                if len(selectedElements) > previousCount:
                    found = True
                    currentSelector = selector
                    previousCount = len(selectedElements)

                selector = selector[0:selector.rindex(":nth-child(")]
            except ValueError:
                break

        if found:
            article_path = article_paths.get(currentSelector)
            if article_path:
                article_paths[currentSelector] = article_path+1
            else:
                article_paths[currentSelector] = 1

    article_selector_path = ""
    for article_path, count in article_paths.items():
        if count > 3:
            article = soup.select(article_path)[0]
            headerElements = article.select("header, h1, h2, h3, h4, h5, h6")

            if headerElements:
                for headerElement in headerElements:
                    linkElement = headerElement.find_all('a', href=True)
                    if linkElement:
                        css_path = get_css_path(linkElement[0])
                        article_selector_path = article_path + \
                            css_path[len(article_path)+len("nth-child(x) "):]
                        break

    article_links = []
    articles = soup.select(article_selector_path)
    for article in articles:
        link = article["href"]
        if not (link.startswith("http://") or link.startswith("https://")):
            link = url + link
        article_links.append(link)

    return (blogSelection, article_links)


def download_article(url):
    article = Article(url, keep_article_html=True)
    article.download()
    article.parse()
    article.nlp()
    return article
