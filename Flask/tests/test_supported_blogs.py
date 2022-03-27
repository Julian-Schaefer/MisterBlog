
from app.articleselector import get_article_selectors


def test_supported_blogs():
    supported_blogs = ["https://lindaloves.de/diy",
                       "https://freddysblog.com",
                       "https://www.heise.de/developer/",
                       "https://www.kauffmann.nl/",
                       "https://robertostefanettinavblog.com/",
                       "https://devblogs.microsoft.com/powershell"
                       ]

    for supported_blog in supported_blogs:
        article_selectors = get_article_selectors(supported_blog)

        if not article_selectors or len(article_selectors[0]) < 1:
            raise BaseException("Blog is not supported: " + supported_blog)
