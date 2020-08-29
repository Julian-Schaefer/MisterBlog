package org.sheeper.blogify.repository;

import org.sheeper.blogify.model.BlogSelection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogSelectionRepository extends JpaRepository<BlogSelection, String> {

}