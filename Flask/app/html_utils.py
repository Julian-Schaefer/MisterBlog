
import re
from bs4 import BeautifulSoup
import requests
import tldextract
from urllib.parse import urlsplit


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
    headers = {'User-Agent': 'Mozilla/5.0'}
    html_doc = requests.get(url, headers=headers).text
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

    possible_hrefs = []
    for link in soup.find_all('a', href=True):
        href = link["href"]
        if "2" in href:
            possible_hrefs += [href]

    possible_hrefs.sort(key=len)

    for href in possible_hrefs:
        try:
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


def get_href_from_link(blog_url, link):
    root_url = get_root_url(blog_url)
    href = link["href"]
    if href.startswith("/"):
        return root_url + href

    return href


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
