from goose3 import Goose
from lxml import etree
import requests
from bs4 import BeautifulSoup

# url = 'https://freddysblog.com/2021/03/02/
# restoring-your-online-business-central-database-locally/'
url = (
    "https://www.waldo.be/2021/07/06/the-complexity-of-complex",
    "-return-types-updated-looping-a-record-return-type/",
)

g = Goose()
article = g.extract(url=url)
print(article.cleaned_text)
xpath = article.top_node.getroottree().getpath(article.top_node)
print(xpath)

webpage = requests.get(url)
soup = BeautifulSoup(webpage.content, "html.parser")
dom = etree.HTML(str(soup))
print(dom.xpath("/html/body/div[1]/div")[0].text)
