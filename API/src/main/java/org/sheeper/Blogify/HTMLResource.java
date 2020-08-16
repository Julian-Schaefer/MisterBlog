package org.sheeper.Blogify;

import java.io.IOException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

@Path("/html")
public class HTMLResource {

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getHTML(@QueryParam("url") String url, @QueryParam("headerSelector") String headerSelector) {
        if (url == null) {
            throw new RuntimeException("Please provide a URL.");
        }

        try {
            if (headerSelector != null) {
                return HTMLService.getHTML(url, headerSelector);
            }

            return HTMLService.getHTML(url);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}