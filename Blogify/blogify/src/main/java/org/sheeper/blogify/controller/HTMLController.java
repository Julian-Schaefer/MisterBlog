package org.sheeper.blogify.controller;

import java.io.IOException;
import java.util.Optional;

import org.sheeper.blogify.service.HTMLService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/html")
public class HTMLController {

    @GetMapping
    public String getHTML(@RequestParam("url") String url,
            @RequestParam("headerSelector") Optional<String> headerSelector) {
        if (url == null) {
            throw new RuntimeException("Please provide a URL.");
        }

        try {
            if (headerSelector.isPresent()) {
                return HTMLService.getHTML(url, headerSelector.get());
            }

            return HTMLService.getHTML(url);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}