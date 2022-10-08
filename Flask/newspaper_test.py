from newspaper import Article
import newspaper

url = "http://fox13now.com/2013/12/30/new-year-new-laws-obamacare-pot-guns-and-drones/"
url = (
    "https://freddysblog.com/2021/02/28/running-business-central",
    "-in-docker-using-sql-on-the-host/",
)
# url = 'https://www.waldo.be/2021/07/06/the-complexity-of-
# complex-return-types-updated-looping-a-record-return-type/'
article = Article(url, keep_article_html=True)
article.download()
article.parse()
article.set_article_html
article.nlp()

# https://newspaper.readthedocs.io/en/latest/user_guide/advanced.html
article.clean_doc
article.clean_top_node

print(article.article_html)
# print(article.text)

print(article.title)
print(article.keywords)
print(article.summary)
print(article.additional_data)
print(article.publish_date)
print(article.authors)

cnn_paper = newspaper.build("http://cnn.com")

for article in cnn_paper.articles:
    print(article.url)


def test():
    return "Hallo"
