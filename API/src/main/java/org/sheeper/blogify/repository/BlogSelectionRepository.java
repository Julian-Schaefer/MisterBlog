package org.sheeper.blogify.repository;

import java.util.List;

import org.sheeper.blogify.model.BlogSelection;
import org.sheeper.blogify.model.BlogSelectionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogSelectionRepository extends JpaRepository<BlogSelection, BlogSelectionId> {

    public List<BlogSelection> findAllByUserId(String userId);

    public List<BlogSelection> findAllByUserIdAndIsSelectedTrue(String userId);

}