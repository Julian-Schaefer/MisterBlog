package org.sheeper.Blogify;

import java.io.IOException;

import org.jsoup.Jsoup;

public class HTMLService {

    public static String getHTML(String url) throws IOException {
        var doc = Jsoup.connect(url).get();

        var bodyElement = doc.getElementsByTag("body").first();
        bodyElement.select("a").forEach((link) -> {
            link.removeAttr("href");
        });

        return bodyElement.html();
    }

    public static String getHTML(String url, String headerSelector) throws IOException {
        var doc = Jsoup.connect(url).get();

        var headerElement = doc.select(headerSelector).first();
        var linkElement = headerElement.select("a[href]");
        var blogPostUrl = linkElement.attr("href");

        return HTMLService.getHTML(blogPostUrl);
    }
}