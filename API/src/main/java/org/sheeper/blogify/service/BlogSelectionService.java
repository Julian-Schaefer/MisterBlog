package org.sheeper.blogify.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlogSelectionService {

    @Autowired
    private HTMLService htmlService;

    public List<BlogPost> getBlogPostFromBlogSelection(BlogSelection blogSelection, int page) {
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
            for (int i = 0; i < postHeaderElements.size(); i++) {
                var postHeaderElement = postHeaderElements.get(i);
                var postIntroductionElement = postIntroductionElements.get(i);

                var linkElements = postHeaderElement.select("a[href]");
                var blogPostUrl = linkElements.first().attr("href");

                var blogPost = getBlogPostFromUrl(blogSelection, blogPostUrl);
                blogPost.setIntroduction(postIntroductionElement.text());
                blogPosts.add(blogPost);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return blogPosts;
    }

    public BlogPost getBlogPostFromUrl(BlogSelection blogSelection, String url) {
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
            blogPost.setUrl(url);
            blogPost.setTitle(headerElement.text());
            blogPost.setAuthor(authorElement.text());
            var date = parseDate(dateElement.text());
            blogPost.setDate(date);
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
