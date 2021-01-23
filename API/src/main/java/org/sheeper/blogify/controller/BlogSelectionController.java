package org.sheeper.blogify.controller;

import java.security.Principal;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.modelmapper.ModelMapper;
import org.sheeper.blogify.dto.SelectedBlogDTO;
import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.sheeper.blogify.model.BlogSelectionId;
import org.sheeper.blogify.repository.BlogSelectionRepository;
import org.sheeper.blogify.service.BlogPostCollector;
import org.sheeper.blogify.service.BlogSelectionService;
import org.sheeper.blogify.service.HTMLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/blog-selection")
public class BlogSelectionController {

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private BlogSelectionRepository blogSelectionRepository;

    @Autowired
    private BlogSelectionService blogSelectionService;

    @Autowired
    private BlogPostCollector blogPostCollector;

    @Autowired
    private HTMLService htmlService;

    @PostMapping
    public ResponseEntity<String> registerBlogSelection(@RequestBody BlogSelection blogSelection, Principal principal) {
        var userId = principal.getName();

        try {
            var blogPostListDocument = htmlService.getDocument(blogSelection.getBlogUrl());

            var postHeaderElements = blogPostListDocument.select(blogSelection.getPostHeaderSelector());
            var postIntroductionElements = blogPostListDocument.select(blogSelection.getPostHeaderSelector());

            String blogPostUrl = null;
            if (postHeaderElements.size() == 0 || postHeaderElements.size() != postIntroductionElements.size()) {
                throw new RuntimeException("Das hat nicht funktioniert " + postHeaderElements.size() + " "
                        + postIntroductionElements.size());
            } else {
                var linkElements = postHeaderElements.first().select("a[href]");
                if (linkElements.size() > 0) {
                    blogPostUrl = linkElements.first().attr("href");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("kein Blog Post Link gefunden");
                }
            }

            var oldPostsElement = blogPostListDocument.select(blogSelection.getOldPostsSelector());
            if (oldPostsElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere old posts elemente gefunden: " + oldPostsElement.size());
            } else {
                var linkElements = oldPostsElement.first().select("a[href]");
                if (linkElements.size() > 0) {
                    var oldPostsUrl = linkElements.first().attr("href");
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("kein Old Post Link gefunden");
                }
            }

            var blogPostDocument = htmlService.getDocument(blogPostUrl);

            var headerElement = blogPostDocument.select(blogSelection.getHeaderSelector());
            if (headerElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere header elemente gefunden: " + headerElement.size());
            }

            var contentElement = blogPostDocument.select(blogSelection.getContentSelector());
            if (contentElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere content elemente gefunden: " + contentElement.size());
            }

            var authorElement = blogPostDocument.select(blogSelection.getAuthorSelector());
            if (authorElement.size() != 1) {
                for (var author : authorElement) {
                    System.out.println(author.html());
                }

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere autor elemente gefunden: " + authorElement.size());
            }

            var dateElement = blogPostDocument.select(blogSelection.getDateSelector());
            if (dateElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere datums elemente gefunden: " + dateElement.size());
            } else {
                if (blogSelectionService.parseDate(dateElement.text()) == null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Date Format gibbet nicht");
                }
            }

            blogSelection.setUserId(userId);
            blogSelectionRepository.save(blogSelection);

            return ResponseEntity.ok().body("Success");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public List<BlogPost> getBlogPosts(HttpServletRequest request,
            @RequestParam(value = "offset", required = false, defaultValue = "0") int offset,
            @RequestParam(value = "limit", required = false, defaultValue = "20") int limit, Principal principal) {
        var userId = principal.getName();
        List<BlogPost> blogPosts = new LinkedList<BlogPost>();

        var blogSelections = blogSelectionRepository.findAllByUserIdAndIsSelectedTrue(userId);

        if (blogSelections.size() == 0) {
            return blogPosts;
        }

        blogPosts = blogPostCollector.getBlogPostsFromBlogSelections(request.getRequestURL().toString(), blogSelections,
                offset);

        return blogPosts.subList(offset, blogPosts.size());
    }

    @GetMapping("/post")
    public BlogPost getBlogPostFromUrl(HttpServletRequest request, @RequestParam("url") String url,
            Principal principal) {
        var userId = principal.getName();

        var blogSelections = blogSelectionRepository.findAllByUserId(userId);
        for (var blogSelection : blogSelections) {
            if (url.startsWith(blogSelection.getBlogUrl())) {
                return blogSelectionService.getBlogPostFromUrl(request.getRequestURL().toString(), blogSelection, url);
            }
        }

        return null;
    }

    @GetMapping("/selected")
    public List<SelectedBlogDTO> getSelectedBlogs(Principal principal) {
        var userId = principal.getName();
        var blogSelections = blogSelectionRepository.findAllByUserId(userId);
        var selectedBlogDTOs = new LinkedList<SelectedBlogDTO>();

        for (var blogSelection : blogSelections) {
            var selectedBlogDTO = modelMapper.map(blogSelection, SelectedBlogDTO.class);
            selectedBlogDTOs.add(selectedBlogDTO);
        }

        return selectedBlogDTOs;
    }

    @PostMapping("/selected")
    public void setSelectedBlogs(@RequestBody List<SelectedBlogDTO> selectedBlogDTOs, Principal principal) {
        var userId = principal.getName();

        for (var selectedBlogDTO : selectedBlogDTOs) {
            var blogSelection = blogSelectionRepository
                    .getOne(new BlogSelectionId(selectedBlogDTO.getBlogUrl(), userId));
            blogSelection.setSelected(selectedBlogDTO.isSelected());
            blogSelectionRepository.save(blogSelection);
        }
    }
}