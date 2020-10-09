package org.sheeper.blogify.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;

@Entity
@IdClass(BlogSelectionId.class)
public class BlogSelection {

    @Id
    private String blogUrl;

    @Id
    private String userId;

    private boolean isSelected;
    private String postHeaderSelector;
    private String postIntroductionSelector;
    private String oldPostsSelector;
    private String headerSelector;
    private String dateSelector;
    private String authorSelector;
    private String contentSelector;

    public BlogSelection() {
        this.isSelected = true;
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

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean isSelected) {
        this.isSelected = isSelected;
    }

    public String getPostHeaderSelector() {
        return postHeaderSelector;
    }

    public void setPostHeaderSelector(String postHeaderSelector) {
        this.postHeaderSelector = postHeaderSelector;
    }

    public String getPostIntroductionSelector() {
        return postIntroductionSelector;
    }

    public void setPostIntroductionSelector(String postIntroductionSelector) {
        this.postIntroductionSelector = postIntroductionSelector;
    }

    public String getOldPostsSelector() {
        return oldPostsSelector;
    }

    public void setOldPostsSelector(String oldPostsSelector) {
        this.oldPostsSelector = oldPostsSelector;
    }

    public String getHeaderSelector() {
        return headerSelector;
    }

    public void setHeaderSelector(String headerSelector) {
        this.headerSelector = headerSelector;
    }

    public String getDateSelector() {
        return dateSelector;
    }

    public void setDateSelector(String dateSelector) {
        this.dateSelector = dateSelector;
    }

    public String getAuthorSelector() {
        return authorSelector;
    }

    public void setAuthorSelector(String authorSelector) {
        this.authorSelector = authorSelector;
    }

    public String getContentSelector() {
        return contentSelector;
    }

    public void setContentSelector(String contentSelector) {
        this.contentSelector = contentSelector;
    }
}