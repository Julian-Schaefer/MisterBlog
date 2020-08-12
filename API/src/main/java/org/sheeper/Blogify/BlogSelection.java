package org.sheeper.Blogify;

public class BlogSelection {

    private String blogUrl;
    private String headerSelector;
    private String dateSelector;
    private String authorSelector;
    private String introductionSelector;
    private String contentSelector;
    private String nextPageSuffix;

    public BlogSelection() {
    }

    public String getBlogUrl() {
        return blogUrl;
    }

    public void setBlogUrl(String blogUrl) {
        this.blogUrl = blogUrl;
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

    public String getIntroductionSelector() {
        return introductionSelector;
    }

    public void setIntroductionSelector(String introductionSelector) {
        this.introductionSelector = introductionSelector;
    }

    public String getContentSelector() {
        return contentSelector;
    }

    public void setContentSelector(String contentSelector) {
        this.contentSelector = contentSelector;
    }

    public String getNextPageSuffix() {
        return nextPageSuffix;
    }

    public void setNextPageSuffix(String nextPageSuffix) {
        this.nextPageSuffix = nextPageSuffix;
    }
}