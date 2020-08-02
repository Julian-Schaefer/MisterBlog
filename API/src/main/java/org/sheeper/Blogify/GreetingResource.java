package org.sheeper.Blogify;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Path("/hello")
public class GreetingResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Article> hello() {
        try {
            Document doc = Jsoup.connect("https://navbitsbytes.com").get();
            var articleElements = doc.select("article.post");
            if (articleElements.isEmpty()) {
                articleElements = doc.select("div.post");
            }
            List<Article> articles = new LinkedList<>();
            for (var articleElement : articleElements) {
                Article article = new Article();
                article.setTitle(articleElement.select(".entry-title").first().text());
                article.setIntroduction(articleElement.select(".entry-content").first().children().first().text());
                article.setContent(articleElement.select(".entry-title").first().text());
                articles.add(article);
            }

            return articles;
        } catch (

        IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    @GET
    @Path("html")
    @Produces(MediaType.TEXT_PLAIN)
    public String getHTML() {
        var url = "https://freddysblog.com";

        try {
            Document doc = Jsoup.connect(url).get();

            var bodyElement = doc.getElementsByTag("body").first();
            bodyElement.select("a").forEach((link) -> {
                link.removeAttr("href");
            });
            return bodyElement.html();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}