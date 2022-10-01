import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { EMPTY, Observable, of } from 'rxjs';
import { map, catchError, withLatestFrom, switchMap, exhaustMap, filter, take } from 'rxjs/operators';
import { BlogService } from 'src/app/services/blog/blog.service';
import * as PostListActions from './post-list.actions';
import { selectPostListState } from './post-list.reducer';

@Injectable()
export class PostListEffects {

    initializePostList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PostListActions.initializePostList),
            map(() => {
                const blogPosts = this.blogService.getBlogPostsFromLocalStorage();
                return PostListActions.initializePostListSuccess({ blogPosts });
            }),
            catchError(_ => EMPTY)
        )
    );

    refreshPostList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PostListActions.refreshPostList),
            withLatestFrom(this.store.select(selectPostListState)),
            switchMap(([_, state]) => {
                return this.blogService.getBlogPosts(state.latestDate)
                    .pipe(
                        map(blogPosts => {
                            this.blogService.saveBlogPostsToLocalStorage(blogPosts);
                            return PostListActions.refreshPostListSuccess({ blogPosts })
                        }),
                        catchError(error => of(PostListActions.refreshPostListFailed({ error })))
                    )
            })
        )
    );

    loadMorePostList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(PostListActions.loadMorePostList),
            withLatestFrom(this.store.select(selectPostListState)),
            filter(([_, state]) => !state.refreshing),
            exhaustMap(([_, state]) => {
                return this.blogService.getBlogPosts(state.latestDate)
                    .pipe(
                        map(blogPosts => {
                            blogPosts = state.blogPosts.concat(blogPosts);
                            this.blogService.saveBlogPostsToLocalStorage(blogPosts);
                            return PostListActions.loadMorePostListSuccess({ blogPosts })
                        }),
                        take(1),
                        catchError(error => of(PostListActions.loadMorePostListFailed({ error })))
                    );
            })
        )
    );

    constructor(
        private actions$: Actions,
        private blogService: BlogService,
        private store: Store
    ) { }
}