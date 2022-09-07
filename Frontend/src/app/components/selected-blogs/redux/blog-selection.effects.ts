import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';
import { BlogService } from 'src/app/services/blog/blog.service';
import * as BlogSelectionActions from './blog-selection.actions';
import { selectBlogSelectionState } from './blog-selection.reducer';

@Injectable()
export class BlogSelectionEffects {

    getSelectedBlogs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BlogSelectionActions.getBlogSelection),
            withLatestFrom(this.store.select(selectBlogSelectionState)),
            mergeMap(([_, state]) => this.blogService.getSelectedBlogs()
                .pipe(
                    map(blogSelections => {
                        let hasChanged = false;
                        if (blogSelections.length !== state.selectedBlogs.length) {
                            hasChanged = true;
                        } else {
                            for (const blogSelection of blogSelections) {
                                if (state.selectedBlogs.some((selectedBlog =>
                                    selectedBlog.blogUrl !== blogSelection.blogUrl || selectedBlog.isSelected !== blogSelection.isSelected))) {
                                    hasChanged = true;
                                    break;
                                }
                            }
                        }

                        return BlogSelectionActions.getBlogSelectionSuccess({ blogSelections, hasChanged })
                    }),
                    catchError(error => of(BlogSelectionActions.getBlogSelectionFailed({ error })))
                )
            )
        )
    );

    toggleSelectedBlog$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BlogSelectionActions.toggleBlogSelection),
            withLatestFrom(this.store.select(selectBlogSelectionState)),
            mergeMap(([_, state]) => this.blogService.setSelectedBlogs(state.selectedBlogs)
                .pipe(
                    map(blogSelections => BlogSelectionActions.getBlogSelectionSuccess({ blogSelections, hasChanged: true })),
                    catchError(error => of(BlogSelectionActions.getBlogSelectionFailed({ error })))
                )
            )
        )
    );

    deleteSelectedBlog$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BlogSelectionActions.deleteBlogSelection),
            mergeMap((action) => this.blogService.deleteSelectedBlog(action.blogSelection)
                .pipe(
                    map(_ => BlogSelectionActions.getBlogSelection({ showLoadingIndicator: false })),
                    catchError(error => of(BlogSelectionActions.getBlogSelectionFailed({ error })))
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private blogService: BlogService,
        private store: Store
    ) { }
}