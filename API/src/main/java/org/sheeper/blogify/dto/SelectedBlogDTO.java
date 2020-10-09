package org.sheeper.blogify.dto;

public class SelectedBlogDTO {

    private String blogUrl;
    private boolean isSelected;

    public SelectedBlogDTO() {
    }

    public String getBlogUrl() {
        return blogUrl;
    }

    public void setBlogUrl(String blogUrl) {
        this.blogUrl = blogUrl;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean isSelected) {
        this.isSelected = isSelected;
    }
}
