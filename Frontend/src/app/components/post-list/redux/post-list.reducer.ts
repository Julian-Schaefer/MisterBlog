import { createReducer, on } from '@ngrx/store';
import * as PostListActions from './post-list.actions';
import { BlogPost } from 'src/app/services/BlogPost';

export interface PostListState {
    refreshing: boolean;
    loadingMore: boolean;
    latestDate?: Date;
    blogPosts: BlogPost[];
    error: any;
}

export const initialState: PostListState = {
    refreshing: false,
    loadingMore: false,
    latestDate: null,
    blogPosts: [],
    error: null
};

export const reducer = createReducer(
    initialState,
    on(PostListActions.initializePostListSuccess, (state: PostListState, { blogPosts }): PostListState => ({ ...state, blogPosts })),
    on(PostListActions.refreshPostList, (state: PostListState): PostListState => ({ ...state, refreshing: true, loadingMore: false, latestDate: null })),
    on(PostListActions.refreshPostListSuccess, (state: PostListState, { blogPosts }): PostListState => ({ ...state, blogPosts, refreshing: false, loadingMore: false })),
    on(PostListActions.refreshPostListFailed, (state: PostListState, { error }): PostListState => ({ ...state, blogPosts: [], refreshing: false, loadingMore: false, error })),
    on(PostListActions.loadMorePostList, (state: PostListState): PostListState => {
        if (!state.refreshing) {
            return ({ ...state, loadingMore: true, latestDate: state.blogPosts[state.blogPosts.length - 1].date })
        }

        return state;
    }),
    on(PostListActions.loadMorePostListSuccess, (state: PostListState, { blogPosts }): PostListState => {
        if (state.loadingMore) {
            return ({ ...state, blogPosts, loadingMore: false });
        }

        return ({ ...state, loadingMore: false });
    }),
    on(PostListActions.loadMorePostListFailed, (state: PostListState, { error }): PostListState => ({ ...state, blogPosts: [], loadingMore: false, error }))
);

export const selectPostListState = (state: any): PostListState => {
    return state.postList;
}