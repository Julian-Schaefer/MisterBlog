package org.sheeper.Blogify;

import java.util.LinkedList;
import java.util.List;

import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.jsoup.Jsoup;

@Path("blog-selection")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class BlogSelectionResource {

    @Inject
    private BlogSelectionRepository blogSelectionRepository;

    @POST
    @Transactional
    public String registerBlogSelection(BlogSelection blogSelection) {
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
                    System.out.println(blogPostUrl);
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
                    System.out.println(oldPostsUrl);
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
            }

            blogSelectionRepository.persist(blogSelection);

            return "das hat funktioniert!";
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GET
    public List<BlogPost> getBlogPosts() {
        var blogPosts = new LinkedList<BlogPost>();

        try {
            var blogSelections = blogSelectionRepository.findAll().list();

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

                    BlogPost blogPost = new BlogPost();
                    blogPost.setUrl(blogPostUrl);
                    blogPost.setTitle(headerElement.text());
                    blogPost.setIntroduction(postIntroductionElement.text());
                    blogPost.setAuthor(authorElement.text());
                    blogPost.setDate(dateElement.text());
                    blogPost.setContent(contentElement.html());
                    blogPosts.add(blogPost);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return blogPosts;
    }
}