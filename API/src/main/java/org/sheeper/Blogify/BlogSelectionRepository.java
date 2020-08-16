package org.sheeper.Blogify;

import javax.enterprise.context.ApplicationScoped;

import io.quarkus.hibernate.orm.panache.PanacheRepository;

@ApplicationScoped
public class BlogSelectionRepository implements PanacheRepository<BlogSelection> {

}