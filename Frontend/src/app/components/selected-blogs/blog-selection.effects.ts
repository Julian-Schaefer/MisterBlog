import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { BlogService } from 'src/app/services/blog/blog.service';
import * as BlogSelectionActions from './blog-selection.actions';

@Injectable()
export class BlogSelectionEffects {

    getSelectedBlogs$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BlogSelectionActions.getBlogSelection),
            mergeMap(() => this.blogService.getSelectedBlogs()
                .pipe(
                    map(blogSelections => BlogSelectionActions.getBlogSelectionSuccess({ blogSelections })),
                    catchError(error => of(BlogSelectionActions.getBlogSelectionFailed({ error })))
                )
            )
        )
    );

    constructor(
        private actions$: Actions,
        private blogService: BlogService
    ) { }
}