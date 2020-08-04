package org.sheeper.Blogify;

import java.io.IOException;

import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Path("blog-selection")
public class BlogSelectionResource {

    @POST
    public String registerBlogSelection(BlogSelection blogSelection) {
        try {
            Document doc = Jsoup.connect(blogSelection.getBlogUrl()).get();

            var headerElements = doc.select(blogSelection.getHeaderSelector());
            var authorElements = doc.select(blogSelection.getAuthorSelector());
            var dateElements = doc.select(blogSelection.getDateSelector());
            var introductionElements = doc.select(blogSelection.getIntroductionSelector());

            if (headerElements.size() != 0 && headerElements.size() == authorElements.size()
                    && authorElements.size() == dateElements.size()
                    && dateElements.size() == introductionElements.size()) {
                return "Das hat funktioniert " + headerElements.size() + " " + authorElements.size() + " "
                        + dateElements.size() + " " + introductionElements.size();
            } else {
                return "die anzahl passt nicht" + headerElements.size() + " " + authorElements.size() + " "
                        + dateElements.size() + " " + introductionElements.size();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

}