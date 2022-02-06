import { createReducer, on } from '@ngrx/store';
import { SelectedBlog } from 'src/app/services/SelectedBlog';
import * as BlogSelectionActions from './blog-selection.actions';

export interface State {
    selectedBlogs: SelectedBlog[];
    hasChanged: boolean;
    loading: boolean;
    error: any;
}

export const initialState: State = {
    selectedBlogs: [],
    hasChanged: false,
    loading: false,
    error: null,
};

export const reducer = createReducer(
    initialState,
    on(BlogSelectionActions.addBlogSelection, (state, { blogSelection }) => ({ ...state, selectedBlogs: [...state.selectedBlogs, blogSelection], hasChanged: true })),
    on(BlogSelectionActions.getBlogSelection, (state, { showLoadingIndicator }) => (({ ...state, loading: showLoadingIndicator, error: null, hasChanged: false }))),
    on(BlogSelectionActions.getBlogSelectionSuccess, (state, { blogSelections, hasChanged }) => {
        return ({ ...state, loading: false, selectedBlogs: blogSelections, hasChanged })
    }),
    on(BlogSelectionActions.getBlogSelectionFailed, (state, { error }) => ({ ...state, loading: false, error: error, hasChanged: false })),
    on(BlogSelectionActions.toggleBlogSelection, (state, { blogSelection }) => {
        const toggledBlogSelection: SelectedBlog = { ...blogSelection, isSelected: !blogSelection.isSelected };
        const newSelectedBlogs: SelectedBlog[] = [toggledBlogSelection];
        for (const currentBlogSelection of state.selectedBlogs) {
            if (currentBlogSelection.blogUrl !== blogSelection.blogUrl) {
                newSelectedBlogs.push(currentBlogSelection);
            }
        }

        return ({ ...state, selectedBlogs: newSelectedBlogs, hasChanged: false })
    }),
);

export const selectBlogSelectionState = (state: any): State => {
    return state.blogSelection;
}