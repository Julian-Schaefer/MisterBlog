package org.sheeper.blogify.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

@Service
public class HTMLService {

    public static String getHTML(String url, String headerSelector) throws IOException {
        url = url.replaceAll("/$", "");
        var doc = Jsoup.connect(url).get();
        var docBody = doc.body();

        var headerElement = docBody.select(headerSelector).first();
        var linkElement = headerElement.select("a[href]");
        var blogPostUrl = linkElement.attr("href");

        return doc.toString();
    }

    public static String getHTML(String url) throws IOException {
        var doc = Jsoup.connect(url).get();

        var bodyElement = doc.getElementsByTag("body").first();
        bodyElement.select("a").forEach((link) -> {
            link.removeAttr("href");
        });

        final String correctedUrl = url.replaceAll("/$", "");
        doc.select("link").forEach((link) -> {
            if (link.attr("rel").equals("stylesheet") && link.attr("href").length() > 0) {
                String cssUrl = link.attr("href");
                if (!cssUrl.startsWith("http://") && !cssUrl.startsWith("https://")) {
                    cssUrl = correctedUrl + cssUrl;
                }
                String css = downloadCSS(cssUrl);
                applyCSS(bodyElement, css);
            }
        });

        doc.select("style").forEach((style) -> {
            applyCSS(bodyElement, style.data());
        });

        return doc.toString();
    }

    public static void applyCSS(Element rootElement, String css) {
        int startPos = 0;
        while (css.indexOf("{", startPos) != -1) {
            int openBracePos = css.indexOf("{", startPos);
            int closedBracePos = css.indexOf("}", openBracePos);

            String selector = css.substring(startPos, openBracePos).replace("\n", "").trim();
            String style = css.substring(openBracePos + 1, closedBracePos).replace("\n", "").trim();

            if (selector.contains("@")) {
                startPos = openBracePos + 1;
                break;
            }

            while (selector.contains("/*")) {
                selector = selector.substring(0, selector.indexOf("/*"))
                        + selector.substring(selector.indexOf("*/") + 2, selector.length() - 1);
            }

            if (!selector.contains(":") && !selector.contains("/*")) {
                try {
                    for (var element : rootElement.select(selector)) {
                        element.attr("style", element.attr("style") + " " + style + ";");
                    }
                } catch (Exception e) {
                }
            }

            startPos = closedBracePos + 1;
        }
    }

    public static String downloadCSS(String url) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return null;
    }
}