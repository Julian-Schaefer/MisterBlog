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

export const getPostListSuccess = createAction(
    '[Post List] Get Success',
    props<{ blogPosts: BlogPost[] }>()
);

export const getPostListFailed = createAction(
    '[Post List] Get Failed',
    props<{ error: string }>()
);