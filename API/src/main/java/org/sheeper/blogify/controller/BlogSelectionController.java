package org.sheeper.blogify.controller;

import java.security.Principal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.jsoup.Jsoup;
import org.modelmapper.ModelMapper;
import org.sheeper.blogify.dto.SelectedBlogDTO;
import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.sheeper.blogify.model.BlogSelectionId;
import org.sheeper.blogify.repository.BlogSelectionRepository;
import org.sheeper.blogify.service.BlogSelectionService;
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

    @PostMapping
    public ResponseEntity<String> registerBlogSelection(@RequestBody BlogSelection blogSelection, Principal principal) {
        var userId = principal.getName();

        try {
            var blogPostListDocument = Jsoup.connect(blogSelection.getBlogUrl()).get();
            var blogPostListDocumentBody = blogPostListDocument.body();

            var postHeaderElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());
            var postIntroductionElements = blogPostListDocumentBody.select(blogSelection.getPostHeaderSelector());

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

            var oldPostsElement = blogPostListDocumentBody.select(blogSelection.getOldPostsSelector());
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

            var blogPostDocument = Jsoup.connect(blogPostUrl).get();
            var blogPostDocumentBody = blogPostDocument.body();

            var headerElement = blogPostDocumentBody.select(blogSelection.getHeaderSelector());
            if (headerElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere header elemente gefunden: " + headerElement.size());
            }

            var contentElement = blogPostDocumentBody.select(blogSelection.getContentSelector());
            if (contentElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere content elemente gefunden: " + contentElement.size());
            }

            var authorElement = blogPostDocumentBody.select(blogSelection.getAuthorSelector());
            if (authorElement.size() != 1) {
                for (var author : authorElement) {
                    System.out.println(author.html());
                }

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere autor elemente gefunden: " + authorElement.size());
            }

            var dateElement = blogPostDocumentBody.select(blogSelection.getDateSelector());
            if (dateElement.size() != 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("mehrere datums elemente gefunden: " + dateElement.size());
            } else {
                if (parseDate(dateElement.text()) == null) {
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
    public List<BlogPost> getBlogPosts(@RequestParam("offset") Optional<Integer> offset,
            @RequestParam("limit") Optional<Integer> limit, Principal principal) {
        var userId = principal.getName();
        var blogPosts = new LinkedList<BlogPost>();

        var blogSelections = blogSelectionRepository.findAllByUserIdAndIsSelectedTrue(userId);

        for (var blogSelection : blogSelections) {
            var additionalBlogPosts = blogSelectionService.getBlogPostFromBlogSelection(blogSelection, 0);
            blogPosts.addAll(additionalBlogPosts);
        }

        blogPosts.sort(new Comparator<BlogPost>() {
            public int compare(BlogPost a, BlogPost b) {
                return a.getDate().compareTo(b.getDate()) * -1;
            }
        });

        return blogPosts;
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

    public static Date parseDate(String dateString) {
        List<String> dateFormats = new LinkedList<String>();
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd.MM.yyyy");
        dateFormats.add("dd-MM-yyyy");
        dateFormats.add("MM/dd/yyyy");
        dateFormats.add("dd-M-yyyy hh:mm:ss");
        dateFormats.add("MMMM dd, yyyy");
        dateFormats.add("dd MMMM yyyy");
        dateFormats.add("dd MMMM yyyy zzzz");
        dateFormats.add("E, dd MMM yyyy HH:mm:ss z");

        var locales = new Locale[] { Locale.US, Locale.CHINA, Locale.GERMAN, Locale.FRANCE, Locale.ITALIAN };

        Date parsedDate = null;
        for (String dateFormat : dateFormats) {
            for (Locale locale : locales) {
                SimpleDateFormat dateFormatter = new SimpleDateFormat(dateFormat, locale);
                try {
                    parsedDate = dateFormatter.parse(dateString);
                } catch (ParseException e) {
                }
            }
        }

        return parsedDate;
    }
}