package org.sheeper.blogify.service;

import java.util.Comparator;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.sheeper.blogify.model.BlogPost;
import org.sheeper.blogify.model.BlogSelection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BlogPostCollector {

    @Autowired
    private BlogSelectionService blogSelectionService;

    public List<BlogPost> getBlogPostsFromBlogSelections(String requestUrl, List<BlogSelection> blogSelections,
            int offset) {
        var blogPosts = new LinkedList<BlogPost>();

        int limit = 20;
        int page = 1;

        while ((blogPosts.size() - offset) < limit) {
            ExecutorService executorService = Executors.newFixedThreadPool(blogSelections.size());

            for (var blogSelection : blogSelections) {
                executorService.execute(new BlogSelectionCollectorTask(requestUrl, blogPosts, blogSelection, page));
            }

            executorService.shutdown();

            try {
                boolean finished = executorService.awaitTermination(1, TimeUnit.MINUTES);
                if (finished) {
                    System.out.println("Collection finished successfully.");
                } else {
                    System.out.println("Timeout while collecting Blog Posts.");
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            page++;
        }

        blogPosts.sort(new Comparator<BlogPost>() {
            public int compare(BlogPost a, BlogPost b) {
                return a.getDate().compareTo(b.getDate()) * -1;
            }
        });

        return blogPosts;
    }

    public class BlogSelectionCollectorTask implements Runnable {
        private String requestUrl;
        private List<BlogPost> blogPosts;
        private BlogSelection blogSelection;
        private int page;

        public BlogSelectionCollectorTask(String requestUrl, List<BlogPost> blogPosts, BlogSelection blogSelection,
                int page) {
            this.requestUrl = requestUrl;
            this.blogPosts = blogPosts;
            this.blogSelection = blogSelection;
            this.page = page;
        }

        @Override
        public void run() {
            var additionalBlogPosts = blogSelectionService.getBlogPostFromBlogSelection(requestUrl, blogSelection,
                    page);
            synchronized (blogPosts) {
                blogPosts.addAll(additionalBlogPosts);
            }
        }
    }
}