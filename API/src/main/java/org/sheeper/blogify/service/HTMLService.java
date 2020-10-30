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

    private static String SANDBOX_CONTAINER_ID = "sandbox-container";

    public String getHTML(String url, String headerSelector) throws IOException {
        url = url.replaceAll("/$", "");
        var doc = Jsoup.connect(url).get();
        var docBody = doc.body();

        var headerElement = docBody.select(headerSelector).first();
        var linkElement = headerElement.select("a[href]");
        var blogPostUrl = linkElement.attr("href");

        return getHTML(blogPostUrl);
    }

    public String getHTML(String url) throws IOException {
        var doc = Jsoup.connect(url).get();

        doc.select("a").forEach((link) -> {
            link.removeAttr("href");
        });

        doc.select("script").forEach((script) -> {
            script.remove();
        });

        return doc.html();

        // var bodyElement = doc.getElementsByTag("body").first();
        // bodyElement.select("a").forEach((link) -> {
        // link.removeAttr("href");
        // });

        // doc.select("script").forEach((script) -> {
        // script.remove();
        // });

        // var sandboxElement = new Element("div");
        // sandboxElement.attr("id", SANDBOX_CONTAINER_ID);
        // for (var childElement : bodyElement.children()) {
        // sandboxElement.appendChild(childElement);
        // }
        // bodyElement.appendChild(sandboxElement);

        // String completeCss = "";

        // final String correctedUrl = url.replaceAll("/$", "");
        // for (var link : doc.select("link")) {
        // if (link.attr("rel").equals("stylesheet") && link.attr("href").length() > 0)
        // {
        // String cssUrl = link.attr("href");
        // if (!cssUrl.startsWith("http://") && !cssUrl.startsWith("https://")) {
        // cssUrl = correctedUrl + cssUrl;
        // }
        // // System.out.println(cssUrl);
        // String css = downloadCSS(cssUrl);
        // String adjustedCss = parseCSS(css);
        // completeCss += adjustedCss + " ";

        // // applyCSS(sandboxElement, css);
        // link.remove();
        // }
        // }

        // for (var style : doc.select("style")) {
        // String adjustedCss = parseCSS(style.data());
        // completeCss += adjustedCss + " ";
        // // applyCSS(sandboxElement, style.data());
        // style.remove();
        // }

        // System.out.println(completeCss);
        // sandboxElement.prepend("<style>" + completeCss + "</style>");

        // return bodyElement.html();
    }

    public String parseCSS(String css) {
        String resultCss = "";
        String[] splits = css.split("\\{|\\}");
        boolean selector = true;
        boolean mediaOpen = false;
        for (var split : splits) {
            if (split.contains("@")) {
                resultCss += split + "{ ";
                mediaOpen = true;
                break;
            } else if (split.trim().length() == 0) {
                if (mediaOpen) {
                    resultCss += "} ";
                    mediaOpen = false;
                }
                break;
                // System.out.println("EMPTYYYYYYYYYYYYYYY");
            }

            split = split.replace("\n", "").trim();

            if (selector) {
                // System.out.println("Selector: " + split);
                resultCss += split + "{ ";
            } else {
                // System.out.println("Style: " + split);
                resultCss += split + "} ";
            }

            selector = !selector;
        }

        return resultCss;

        // int startPos = 0;
        // while (css.indexOf("{", startPos) != -1) {
        // int openBracePos = css.indexOf("{", startPos);
        // int closedBracePos = css.indexOf("}", openBracePos);

        // String selector = css.substring(startPos, openBracePos).replace("\n",
        // "").trim();
        // String style = css.substring(openBracePos + 1, closedBracePos).replace("\n",
        // "").trim();

        // String media = null;
        // if (selector.contains("@")) {
        // var closingBraceFound = false;
        // int counter = openBracePos + 1;

        // int openedBraces = 0;
        // int closedBraces = 0;
        // while (!closingBraceFound) {
        // if (css.charAt(counter) == '{') {
        // openedBraces++;
        // } else if (css.charAt(counter) == '}') {
        // closedBraces++;
        // }

        // if (closedBraces > openedBraces) {
        // closingBraceFound = true;
        // }

        // counter++;
        // }

        // String mediaCss = css.substring(openBracePos + 1, counter);
        // parseCSS(mediaCss);
        // startPos = counter + 1;
        // // media = css.substring(startPos, openBracePos);
        // // int nextOpenBracePos = css.indexOf("{", openBracePos + 1);
        // // selector = css.substring(openBracePos + 1, nextOpenBracePos).replace("\n",
        // // "").trim();
        // // style = css.substring(nextOpenBracePos + 1, closedBracePos).replace("\n",
        // // "").trim();
        // } else {
        // if (selector.contains("{") || selector.contains("}")) {
        // System.out.println("WTF");
        // }
        // System.out.println("Sel: " + selector);
        // System.out.println("Style: " + style);
        // startPos = closedBracePos + 1;

        // }

        // if (media != null) {
        // }
        // }

    }

    public String adjustCss(String css) {
        String adjustedCss = "";

        int startPos = 0;
        while (css.indexOf("{", startPos) != -1) {
            int openBracePos = css.indexOf("{", startPos);
            int closedBracePos = css.indexOf("}", openBracePos);

            String selector = css.substring(startPos, openBracePos).replace("\n", "").trim();
            String style = css.substring(openBracePos + 1, closedBracePos).replace("\n", "").trim();

            if (selector.contains("@")) {
                adjustedCss += selector + " { ";
                startPos = openBracePos + 1;
                var endPos = startPos;

                int openedBraces = 0;
                int closedBraces = 0;
                boolean closedBraceFound = false;
                while (!closedBraceFound) {
                    var charAt = css.charAt(endPos);
                    if (charAt == '{') {
                        openedBraces += 1;
                    } else if (charAt == '}') {
                        closedBraces += 1;
                    }

                    if ((closedBraces - openedBraces) == 1) {
                        closedBraceFound = true;
                    } else {
                        endPos += 1;
                    }
                }

                var mediaCss = css.substring(startPos, endPos);
                adjustedCss += adjustCss(mediaCss) + " }";
                break;
            }

            while (selector.contains("/*")) {
                selector = selector.substring(0, selector.indexOf("/*"))
                        + selector.substring(selector.indexOf("*/") + 2, selector.length() - 1);
            }

            if (!selector.contains("/*")) {
                if (selector.equals("body")) {
                    adjustedCss += "div#" + SANDBOX_CONTAINER_ID + " {\n" + style + "\n}\n";
                } else if (selector.contains("body")) {
                    selector = selector.replace("body", "");
                    adjustedCss += "div#" + SANDBOX_CONTAINER_ID + " " + selector + " {\n" + style + "\n}\n";
                } else {
                    adjustedCss += "div#" + SANDBOX_CONTAINER_ID + " " + selector + " {\n" + style + "\n}\n";
                }
            }

            startPos = closedBracePos + 1;
        }

        return adjustedCss;
    }

    public void applyCSS(Element rootElement, String css) {
        int startPos = 0;
        while (css.indexOf("{", startPos) != -1) {
            int openBracePos = css.indexOf("{", startPos);
            int closedBracePos = css.indexOf("}", openBracePos);

            String selector = css.substring(startPos, openBracePos).replace("\n", "").trim();
            String style = css.substring(openBracePos + 1, closedBracePos).replace("\n", "").trim();

            if (selector.contains("@")) {
                startPos = openBracePos + 1;
                System.out.println("@ Selector: " + selector);
                break;
            }

            while (selector.contains("/*")) {
                selector = selector.substring(0, selector.indexOf("/*"))
                        + selector.substring(selector.indexOf("*/") + 2, selector.length() - 1);
            }

            if (!selector.contains("/*")) {
                try {
                    for (var element : rootElement.select(selector)) {
                        element.attr("style", element.attr("style") + " " + style + ";");
                    }
                } catch (Exception e) {
                    System.out.println("Could not get selector: " + selector);
                }
            } else {
                System.out.println("Weird Selector: " + selector);
            }

            startPos = closedBracePos + 1;
        }
    }

    public String downloadCSS(String url) {
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