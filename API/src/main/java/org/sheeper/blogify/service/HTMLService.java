package org.sheeper.blogify.service;

import java.io.IOException;

import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;

@Service
public class HTMLService {

    public static String getHTML(String url, String headerSelector) throws IOException {
        var doc = Jsoup.connect(url).get();
        var docBody = doc.body();

        var headerElement = docBody.select(headerSelector).first();
        var linkElement = headerElement.select("a[href]");
        var blogPostUrl = linkElement.attr("href");

        return HTMLService.getHTML(blogPostUrl);
    }

    public static String getHTML(String url) throws IOException {
        var doc = Jsoup.connect(url).get();

        var bodyElement = doc.getElementsByTag("body").first();
        bodyElement.select("a").forEach((link) -> {
            link.removeAttr("href");
        });

        doc.select("style").forEach((style) -> {
            bodyElement.children().first().prependChild(style);
        });

        return bodyElement.html();
    }
}