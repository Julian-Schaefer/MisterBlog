from app.article_selector import get_article_selectors
from app.rss_selector import get_rss_url


def test_supported_blogs():
    supported_blogs = [
        "https://lindaloves.de/diy",
        "https://freddysblog.com",
        "https://www.heise.de/developer/",
        "https://www.kauffmann.nl/",
        "https://robertostefanettinavblog.com/",
        "https://devblogs.microsoft.com/powershell",
        "https://msdynamicsworld.com/d365-business-central-news",
        "https://www.wired.com/most-recent/",
    ]

    # TODO: Support blogs with only one page,
    # then it simply doesnt have pagination and old posts disappear

    for supported_blog in supported_blogs:
        rss_url_result = get_rss_url(supported_blog)
        if not (rss_url_result and rss_url_result[1]):
            article_selectors = get_article_selectors(supported_blog)

            if not article_selectors or len(article_selectors[0]) < 1:
                raise BaseException("Blog is not supported: " + supported_blog)
