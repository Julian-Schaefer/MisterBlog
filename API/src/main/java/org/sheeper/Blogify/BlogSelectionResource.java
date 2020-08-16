package org.sheeper.Blogify;

import javax.inject.Inject;
import javax.transaction.Transactional;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Path("blog-selection")
public class BlogSelectionResource {

    @Inject
    private BlogSelectionRepository blogSelectionRepository;

    @POST
    @Transactional
    public String registerBlogSelection(BlogSelection blogSelection) {
        try {
            Document doc = Jsoup.connect(blogSelection.getBlogUrl()).get();

            var postHeaderElements = doc.select(blogSelection.getPostHeaderSelector());
            var postIntroductionElements = doc.select(blogSelection.getPostHeaderSelector());

            if (postHeaderElements.size() == 0 || postHeaderElements.size() != postIntroductionElements.size()) {
                throw new RuntimeException(
                        "Das hat funktioniert " + postHeaderElements.size() + " " + postIntroductionElements.size());
            }

            var headerElement = doc.select(blogSelection.getHeaderSelector());
            if (headerElement.size() != 1) {
                return "mehrere header elemente gefunden";
            }

            var contentElement = doc.select(blogSelection.getContentSelector());
            if (contentElement.size() != 1) {
                return "mehrere content elemente gefunden";
            }

            var authorElement = doc.select(blogSelection.getAuthorSelector());
            if (authorElement.size() != 1) {
                return "mehrere autor elemente gefunden";
            }

            var dateElement = doc.select(blogSelection.getDateSelector());
            if (dateElement.size() != 1) {
                return "mehrere datums elemente gefunden";
            }

            var oldPostsElement = doc.select(blogSelection.getOldPostsSelector());
            if (oldPostsElement.size() != 1) {
                return "mehrere old posts elemente gefunden";
            } else {
                var linkElements = oldPostsElement.first().select("a[href]");
                if (linkElements.size() > 0) {
                    var oldPostsUrl = linkElements.first().attr("href");
                    System.out.println(oldPostsUrl);
                } else {
                    return "kein Old Post Link gefunden";
                }
            }

            blogSelectionRepository.persist(blogSelection);

            return "das hat funktioniert!";
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}