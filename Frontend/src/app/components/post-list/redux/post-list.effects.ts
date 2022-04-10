import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, Observable, of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, switchMap, take } from 'rxjs/operators';
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
            ofType(PostListActions.refreshPostList, PostListActions.loadMorePostList),
            withLatestFrom(this.store.select(selectPostListState)),
            switchMap(([_, state]) => {
                return this.blogService.getBlogPosts(state.currentPage)
                    .pipe(
                        map(blogPosts => {
                            return PostListActions.getPostListSuccess({ blogPosts })
                        }),
                        catchError(error => of(PostListActions.getPostListFailed({ error })))
                    )
            })
        )
    );

    constructor(
        private actions$: Actions,
        private blogService: BlogService,
        private store: Store
    ) { }
}