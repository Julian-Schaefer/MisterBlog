package org.sheeper.blogify.repository;

import java.util.List;

import org.sheeper.blogify.model.BlogSelection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogSelectionRepository extends JpaRepository<BlogSelection, String> {

    public List<BlogSelection> findAllByUserId(String userId);

    public List<BlogSelection> findAllByUserIdAndIsSelectedTrue(String userId);

}