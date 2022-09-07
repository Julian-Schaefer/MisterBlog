import { createAction, props } from '@ngrx/store';
import { BlogPost } from 'src/app/services/BlogPost';

export const initializePostList = createAction(
    '[Post List] Initialize'
);

export const initializePostListSuccess = createAction(
    '[Post List] Initialize Success',
    props<{ blogPosts: BlogPost[] }>()
);

export const refreshPostList = createAction(
    '[Post List] Refresh'
);

export const loadMorePostList = createAction(
    '[Post List] Load More'
);

export const refreshPostListSuccess = createAction(
    '[Post List] Refresh Success',
    props<{ blogPosts: BlogPost[] }>()
);

export const refreshPostListFailed = createAction(
    '[Post List] Refresh Failed',
    props<{ error: string }>()
);

export const loadMorePostListSuccess = createAction(
    '[Post List] Load More Success',
    props<{ blogPosts: BlogPost[] }>()
);

export const loadMorePostListFailed = createAction(
    '[Post List] Load More Failed',
    props<{ error: string }>()
);