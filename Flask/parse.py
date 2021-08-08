import requests
from bs4 import BeautifulSoup

url = "https://freddysblog.com/"
html_doc = requests.get(url).text
soup = BeautifulSoup(html_doc, 'html.parser')

soup.select()
for link in soup.find_all('a'):
    print(link.parents)
