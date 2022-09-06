import app.html_utils as html_utils
from app.article_downloader import download_article


def get_invalid_article_paths(blog_url, article_paths, page_soup, compare_soup):
    # compare_links = compare_soup.find_all("a", href=True)

    invalid_article_paths = []
    for article_path in article_paths:
        links_on_page = page_soup.select(
            html_utils.selector_path_to_string(article_path), href=True)
        links_on_compare_page = compare_soup.select(
            html_utils.selector_path_to_string(article_path), href=True)
        hrefs_on_page = [html_utils.get_href_from_link(
            blog_url, link) for link in links_on_page]
        hrefs_on_compare_page = [html_utils.get_href_from_link(
            blog_url, link) for link in links_on_compare_page]

        identical_links = 0
        external_links = 0
        domain = html_utils.get_domain(blog_url)
        for href in hrefs_on_page:
            if domain not in href:
                external_links += 1

        for link in links_on_page:
            for compare_link in links_on_compare_page:
                if link["href"] == compare_link["href"]:
                    identical_links += 1

        if identical_links > 0 or external_links > 0:
            invalid_article_paths += [article_path]
            continue

        first_article = download_article(hrefs_on_page[0])
        first_compare_article = download_article(hrefs_on_compare_page[0])
        if ((first_article.summary and len(first_article.summary) > 0 and
             first_article.summary == first_compare_article.summary) or
                first_article.article_html == first_compare_article.article_html):
            invalid_article_paths += [article_path]

    return invalid_article_paths


def get_article_selectors(blog_url):
    page_counter_url = html_utils.get_page_counter_url(blog_url)
    if not page_counter_url:
        return None

    second_page_url = page_counter_url.replace("{page-counter}", str(2))
    third_page_url = page_counter_url.replace("{page-counter}", str(3))

    first_page_soup = html_utils.get_soup_from_url(blog_url)
    second_page_soup = html_utils.get_soup_from_url(second_page_url)
    third_page_soup = html_utils.get_soup_from_url(third_page_url)

    first_article_paths = get_valid_article_paths(
        blog_url, first_page_soup)
    second_article_paths = get_valid_article_paths(
        second_page_url, second_page_soup)

    invalid_article_paths = []
    invalid_article_paths.extend(get_invalid_article_paths(blog_url,
                                                           first_article_paths, first_page_soup, third_page_soup))
    invalid_article_paths.extend(get_invalid_article_paths(blog_url,
                                                           second_article_paths, second_page_soup, third_page_soup))

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
        page_counter_url = html_utils.get_page_counter_url(blog_url)
        page_url = page_counter_url.replace("{page-counter}", str(page))

    soup = html_utils.get_soup_from_url(page_url)

    urls = []
    for article_path in article_paths:
        links = soup.select(
            html_utils.selector_path_to_string(article_path), href=True)
        for link in links:
            href = html_utils.get_href_from_link(blog_url, link)
            if href not in urls:
                urls += [href]

    return urls


def get_valid_article_paths(url, soup):
    link_paths = [html_utils.get_css_path(
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
        links = soup.select(
            html_utils.selector_path_to_string(article_path), href=True)
        if links and len(links) > 0:
            firstLink = links[0]
            if firstLink.has_attr("href"):
                href = html_utils.get_href_from_link(url, firstLink)
                article = download_article(href)
                if article and article.publish_date:
                    valid_article_paths += [article_path]

    return valid_article_paths


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
