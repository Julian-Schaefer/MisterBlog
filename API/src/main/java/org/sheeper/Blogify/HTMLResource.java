package org.sheeper.Blogify;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

@Path("/html")
public class HTMLResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getHTML(@QueryParam("url") String url) {
        if (url == null) {
            throw new RuntimeException("Please provide a URL");
        }

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

    @GET
    @Path("asd")
    @Produces(MediaType.APPLICATION_JSON)
    public List<String> hello() {
        try {
            Document doc = Jsoup.connect("https://freddysblog.com").get();
            var articleElements = doc.select("body div div div div article header h1 a");

            List<String> articles = new LinkedList<>();
            for (var articleElement : articleElements) {
                articles.add(articleElement.text());
                // Article article = new Article();
                // article.setTitle(articleElement.select(".entry-title").first().text());
                // article.setIntroduction(articleElement.select(".entry-content").first().children().first().text());
                // article.setContent(articleElement.select(".entry-title").first().text());
                // articles.add(article);
            }

            return articles;
        } catch (

        IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}