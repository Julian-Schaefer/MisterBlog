package org.sheeper.blogify.model;

import java.io.Serializable;

public class BlogSelectionId implements Serializable {

    private static final long serialVersionUID = 3743735237709139290L;

    private String blogUrl;
    private String userId;

    public BlogSelectionId() {
    }

    public BlogSelectionId(String blogUrl, String userId) {
        this.blogUrl = blogUrl;
        this.userId = userId;
    }

    public String getBlogUrl() {
        return blogUrl;
    }

    public void setBlogUrl(String blogUrl) {
        this.blogUrl = blogUrl;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
