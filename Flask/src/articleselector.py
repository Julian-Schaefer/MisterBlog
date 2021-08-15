import requests
from bs4 import BeautifulSoup
import re


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


url = "https://freddysblog.com/"
html_doc = requests.get(url).text
cleaned_html_doc = bs_preprocess(html_doc)


soup = BeautifulSoup(cleaned_html_doc, 'html.parser')

body = soup.find_next("body")


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


for link in soup.select('a'):
    path = get_css_path(link)
    size = len(soup.select(path))
    if size == 0:
        print(path)

articles = soup.select(
    "body > div:nth-child(3) > div:nth-child(2) > div > div > article")

print(len(articles))
