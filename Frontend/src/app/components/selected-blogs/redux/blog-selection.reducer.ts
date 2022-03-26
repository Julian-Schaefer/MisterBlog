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
    on(BlogSelectionActions.addBlogSelection, (state, { blogSelection }) => {
        const updatedBlogSelection = [...state.selectedBlogs, blogSelection];
        updatedBlogSelection.sort((first, second) => first.blogUrl.localeCompare(second.blogUrl));
        return ({ ...state, selectedBlogs: updatedBlogSelection, hasChanged: true });
    }),
    on(BlogSelectionActions.getBlogSelection, (state, { showLoadingIndicator }) => (({ ...state, loading: showLoadingIndicator, error: null, hasChanged: false }))),
    on(BlogSelectionActions.getBlogSelectionSuccess, (state, { blogSelections, hasChanged }) => {
        return ({ ...state, loading: false, selectedBlogs: blogSelections, hasChanged })
    }),
    on(BlogSelectionActions.getBlogSelectionFailed, (state, { error }) => ({ ...state, loading: false, error: error, hasChanged: false })),
    on(BlogSelectionActions.toggleBlogSelection, (state, { toggledBlogSelection }) => {
        const newSelectedBlogs: SelectedBlog[] = [];

        for (const currentBlogSelection of state.selectedBlogs) {
            if (currentBlogSelection.blogUrl !== toggledBlogSelection.blogUrl) {
                newSelectedBlogs.push(currentBlogSelection);
            } else {
                newSelectedBlogs.push(toggledBlogSelection);
            }
        }

        return ({ ...state, selectedBlogs: newSelectedBlogs, hasChanged: false })
    }),
);

export const selectBlogSelectionState = (state: any): State => {
    return state.blogSelection;
}