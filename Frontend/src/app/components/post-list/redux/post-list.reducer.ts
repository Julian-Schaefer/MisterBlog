import { createReducer, on } from '@ngrx/store';
import * as PostListActions from './post-list.actions';
import { BlogPost } from 'src/app/services/BlogPost';

export interface PostListState {
    loading: boolean;
    loadingMore: boolean;
    currentPage: number;
    blogPosts: BlogPost[];
    error: any;
}

export const initialState: PostListState = {
    loading: false,
    loadingMore: false,
    currentPage: 0,
    blogPosts: [],
    error: null
};

export const reducer = createReducer(
    initialState,
    on(PostListActions.initializePostListSuccess, (state, { blogPosts }) => ({ ...state, blogPosts })),
    on(PostListActions.refreshPostList, (state) => ({ ...state, loading: true, currentPage: 0 })),
    on(PostListActions.loadMorePostList, (state) => ({ ...state, loadingMore: true, currentPage: state.currentPage + 1 })),
    on(PostListActions.getPostListSuccess, (state, { blogPosts }) => ({ ...state, blogPosts, loading: false })),
    on(PostListActions.getPostListFailed, (state, { error }) => ({ ...state, blogPosts: [], loading: false, error }))
);

export const selectPostListState = (state: any): PostListState => {
    return state.postList;
}