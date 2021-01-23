package org.sheeper.blogify.service;

import java.net.MalformedURLException;
import java.net.URL;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import org.jsoup.nodes.Element;
import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlogSelectionService {

    private final static Logger LOGGER = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    @Autowired
    private HTMLService htmlService;

    public List<BlogPost> getBlogPostFromBlogSelection(String requestUrl, BlogSelection blogSelection, int page) {
        LOGGER.info("Getting Blog Posts from " + blogSelection.getBlogUrl() + " on Page " + page);
        var blogPosts = new LinkedList<BlogPost>();

        try {
            var blogPostListDocument = htmlService.getDocument(blogSelection.getBlogUrl());

            if (page > 1) {
                var olderPostsElement = blogPostListDocument.select(blogSelection.getOldPostsSelector());
                var linkolderPostsLinkElement = olderPostsElement.select("a[href]");
                var olderPostsUrl = linkolderPostsLinkElement.first().attr("href");

                String blogPageUrl = null;
                for (var urlComponent : olderPostsUrl.split(("/"))) {
                    try {
                        Integer.parseInt(urlComponent);
                        blogPageUrl = olderPostsUrl.replace(urlComponent, Integer.toString(page));
                    } catch (Exception e) {
                    }
                }

                if (blogPageUrl != null) {
                    blogPostListDocument = htmlService.getDocument(blogPageUrl);
                }
            }

            var blogPostListDocumentBody = blogPostListDocument.body();

            var postHeaderElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());
            var postIntroductionElements = blogPostListDocumentBody.select(blogSelection.getPostIntroductionSelector());

            while (postHeaderElements.size() > postIntroductionElements.size()) {
                var postIntroductionSelector = blogSelection.getPostIntroductionSelector();
                if (postIntroductionSelector.lastIndexOf(">") != -1) {
                    postIntroductionSelector = postIntroductionSelector.substring(0,
                            postIntroductionSelector.lastIndexOf(">"));
                    blogSelection.setPostIntroductionSelector(postIntroductionSelector);
                    postIntroductionElements = blogPostListDocumentBody
                            .select(blogSelection.getPostIntroductionSelector());
                } else {
                    break;
                }
            }

            ExecutorService executorService = Executors.newFixedThreadPool(postHeaderElements.size());

            for (int i = 0; i < postHeaderElements.size(); i++) {
                var postHeaderElement = postHeaderElements.get(i);

                var linkElements = postHeaderElement.select("a[href]");
                var blogPostUrl = linkElements.first().attr("href");

                var postIntroductionElement = postIntroductionElements.get(i);

                executorService.submit(() -> {
                    var blogPost = getBlogPostFromUrl(requestUrl, blogSelection, blogPostUrl);
                    blogPost.setPage(page);

                    try {
                        blogPost.setIntroduction(getIntroduction(postIntroductionElement));
                    } catch (Exception e) {
                        LOGGER.severe("Could not get Introduction Element from " + blogPostUrl + "for Header: "
                                + postHeaderElement.text());
                    }

                    synchronized (blogPosts) {
                        blogPosts.add(blogPost);
                    }
                });
            }

            executorService.shutdown();

            try {
                boolean finished = executorService.awaitTermination(1, TimeUnit.MINUTES);
                if (finished) {
                    System.out.println("Collection finished successfully.");
                } else {
                    System.out.println("Timeout while collecting Blog Posts.");
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return blogPosts;
    }

    public String getIntroduction(Element introductionElement) {
        var introductionElementClone = introductionElement.clone();
        for (var introductionChild : introductionElementClone.children()) {
            introductionChild.remove();
        }

        if (introductionElementClone.text().length() > 0) {
            return introductionElementClone.text();
        } else {
            return introductionElement.text();
        }
    }

    public BlogPost getBlogPostFromUrl(String requestUrl, BlogSelection blogSelection, String url) {
        try {
            var blogPostDocument = htmlService.getDocument(url);
            var headerElement = blogPostDocument.select(blogSelection.getHeaderSelector()).first();
            var authorElement = blogPostDocument.select(blogSelection.getAuthorSelector()).first();
            var dateElement = blogPostDocument.select(blogSelection.getDateSelector()).first();
            var contentElement = blogPostDocument.select(blogSelection.getContentSelector()).first();
            contentElement.select("*").forEach((element) -> {
                element.attr("style", "overflow: auto;");
            });

            BlogPost blogPost = new BlogPost();
            blogPost.setBlogUrl(blogSelection.getBlogUrl());
            blogPost.setPostUrl(url);
            blogPost.setTitle(headerElement.text());
            blogPost.setAuthor(authorElement.text());
            var date = parseDate(dateElement.text());
            blogPost.setDate(date);

            if (contentElement.text().startsWith(headerElement.text())) {
                for (var child : contentElement.children()) {
                    if (child.text().equals(headerElement.text())) {
                        child.remove();
                    }
                }
            }

            try {
                var requestURL = new URL(requestUrl);
                var hostURL = requestURL.getProtocol() + "://" + requestURL.getHost();
                if (requestURL.getPort() != -1) {
                    hostURL += ":" + requestURL.getPort();
                }

                final var imageURL = hostURL + "/image?url=";

                // TODO: adjust properties, instead of removing
                contentElement.select("img").forEach((image) -> {
                    var imageSrc = imageURL + image.attr("src");
                    image.attributes().forEach((attribute) -> {
                        image.attributes().remove(attribute.getKey());
                    });

                    image.attr("src", imageSrc);
                });
            } catch (MalformedURLException e) {
                e.printStackTrace();
            }
            blogPost.setContent(contentElement.html());

            return blogPost;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public Date parseDate(String dateString) {
        List<String> dateFormats = new LinkedList<String>();
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd.MM.yyyy");
        dateFormats.add("dd-MM-yyyy");
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd-M-yyyy hh:mm:ss");
        dateFormats.add("MMMM dd, yyyy");
        dateFormats.add("MMMM d'th', yyyy");
        dateFormats.add("MMMM d'st', yyyy");
        dateFormats.add("MMMM d'nd', yyyy");
        dateFormats.add("MMMM d'rd', yyyy");
        dateFormats.add("dd MMMM yyyy");
        dateFormats.add("dd MMMM yyyy zzzz");
        dateFormats.add("E, dd MMM yyyy HH:mm:ss z");

        var locales = new Locale[] { Locale.US, Locale.CHINA, Locale.GERMAN, Locale.FRANCE, Locale.ITALIAN };

        Date parsedDate = null;
        for (String dateFormat : dateFormats) {
            for (Locale locale : locales) {
                SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat, locale);
                try {
                    parsedDate = dateFormatter.parse(dateString);
                } catch (ParseException e) {
                }
            }
        }

        return parsedDate;
    }
}
