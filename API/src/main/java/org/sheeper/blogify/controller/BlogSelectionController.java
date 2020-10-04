package org.sheeper.blogify.controller;

import java.security.Principal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;

import org.jsoup.Jsoup;
import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.sheeper.blogify.repository.BlogSelectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blog-selection")
public class BlogSelectionController {

    @Autowired
    private BlogSelectionRepository blogSelectionRepository;

    @PostMapping
    public String registerBlogSelection(@RequestBody BlogSelection blogSelection) {
        try {
            var blogPostListDocument = Jsoup.connect(blogSelection.getBlogUrl()).get();
            var blogPostListDocumentBody = blogPostListDocument.body();

            var postHeaderElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());
            var postIntroductionElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());

            String blogPostUrl = null;
            if (postHeaderElements.size() == 0 || postHeaderElements.size() != postIntroductionElements.size()) {
                throw new RuntimeException(
                        "Das hat funktioniert " + postHeaderElements.size() + " " + postIntroductionElements.size());
            } else {
                var linkElements = postHeaderElements.first().select("a[href]");
                if (linkElements.size() > 0) {
                    blogPostUrl = linkElements.first().attr("href");
                } else {
                    return "kein Blog Post Link gefunden";
                }
            }

            var oldPostsElement = blogPostListDocumentBody.select(blogSelection.getOldPostsSelector());
            if (oldPostsElement.size() != 1) {
                return "mehrere old posts elemente gefunden: " + oldPostsElement.size();
            } else {
                var linkElements = oldPostsElement.first().select("a[href]");
                if (linkElements.size() > 0) {
                    var oldPostsUrl = linkElements.first().attr("href");
                } else {
                    return "kein Old Post Link gefunden";
                }
            }

            var blogPostDocument = Jsoup.connect(blogPostUrl).get();
            var blogPostDocumentBody = blogPostDocument.body();

            var headerElement = blogPostDocumentBody.select(blogSelection.getHeaderSelector());
            if (headerElement.size() != 1) {
                return "mehrere header elemente gefunden: " + headerElement.size();
            }

            var contentElement = blogPostDocumentBody.select(blogSelection.getContentSelector());
            if (contentElement.size() != 1) {
                return "mehrere content elemente gefunden: " + contentElement.size();
            }

            var authorElement = blogPostDocumentBody.select(blogSelection.getAuthorSelector());
            if (authorElement.size() != 1) {
                return "mehrere autor elemente gefunden: " + authorElement.size();
            }

            var dateElement = blogPostDocumentBody.select(blogSelection.getDateSelector());
            if (dateElement.size() != 1) {
                return "mehrere datums elemente gefunden: " + dateElement.size();
            } else {
                if (parseDate(dateElement.text()) == null) {
                    return "Date Format gibbet nicht";
                }
            }

            blogSelectionRepository.save(blogSelection);

            return "das hat funktioniert!";
        } catch (Exception e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }

    @GetMapping
    public List<BlogPost> getBlogPosts(Principal principal) {
        var userId = principal.getName();
        System.out.println(userId);

        var blogPosts = new LinkedList<BlogPost>();

        try {
            var blogSelections = blogSelectionRepository.findAll();

            for (var blogSelection : blogSelections) {
                var blogPostListDocument = Jsoup.connect(blogSelection.getBlogUrl()).get();
                var blogPostListDocumentBody = blogPostListDocument.body();

                var postHeaderElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());
                var postIntroductionElements = blogPostListDocumentBody
                        .select(blogSelection.getPostIntroductionSelector());
                for (int i = 0; i < postHeaderElements.size(); i++) {
                    var postHeaderElement = postHeaderElements.get(i);
                    var postIntroductionElement = postIntroductionElements.get(i);

                    var linkElements = postHeaderElement.select("a[href]");
                    var blogPostUrl = linkElements.first().attr("href");

                    var blogPostDocument = Jsoup.connect(blogPostUrl).get();
                    var blogPostDocumentBody = blogPostDocument.body();
                    var headerElement = blogPostDocumentBody.select(blogSelection.getHeaderSelector()).first();
                    var authorElement = blogPostDocumentBody.select(blogSelection.getAuthorSelector()).first();
                    var dateElement = blogPostDocumentBody.select(blogSelection.getDateSelector()).first();
                    var contentElement = blogPostDocumentBody.select(blogSelection.getContentSelector()).first();
                    contentElement.select("*").forEach((element) -> {
                        element.attr("style", "overflow: auto;");
                    });

                    BlogPost blogPost = new BlogPost();
                    blogPost.setUrl(blogPostUrl);
                    blogPost.setTitle(headerElement.text());
                    blogPost.setIntroduction(postIntroductionElement.text());
                    blogPost.setAuthor(authorElement.text());
                    var date = parseDate(dateElement.text());
                    blogPost.setDate(date);
                    blogPost.setContent(contentElement.html());
                    blogPosts.add(blogPost);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        blogPosts.sort(new Comparator<BlogPost>() {
            public int compare(BlogPost a, BlogPost b) {
                return a.getDate().compareTo(b.getDate()) * -1;
            }
        });

        return blogPosts;
    }

    public static Date parseDate(String dateString) {
        List<String> dateFormats = new LinkedList<String>();
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd.MM.yyyy");
        dateFormats.add("dd-MM-yyyy");
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd-M-yyyy hh:mm:ss");
        dateFormats.add("MMMM dd, yyyy");
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