import { createReducer, on } from '@ngrx/store';
import { SelectedBlog } from 'src/app/services/SelectedBlog';
import * as BlogSelectionActions from './blog-selection.actions';

export interface State {
    selectedBlogs: SelectedBlog[];
    loading: boolean;
    error: any;
}

export const initialState: State = {
    selectedBlogs: [],
    loading: false,
    error: null,
};

export const reducer = createReducer(
    initialState,
    on(BlogSelectionActions.addBlogSelection, (state, { blogSelection }) => ({ ...state, selectedBlogs: [...state.selectedBlogs, blogSelection] })),
    on(BlogSelectionActions.getBlogSelection, state => (({ ...state, loading: true, error: null }))),
    on(BlogSelectionActions.getBlogSelectionSuccess, (state, { blogSelections }) => ({ ...state, loading: false, selectedBlogs: blogSelections })),
    on(BlogSelectionActions.getBlogSelectionFailed, (state, { error }) => ({ ...state, loading: false, error: error })),
);

export const selectBlogSelectionState = (state: any): State => {
    return state.blogSelection;
}