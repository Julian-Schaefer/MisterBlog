import { createAction, props } from '@ngrx/store';
import { SelectedBlog } from 'src/app/services/SelectedBlog';

export const addBlogSelection = createAction(
    '[Blog Selection] Add',
    props<{ blogSelection: SelectedBlog }>()
);

export const getBlogSelection = createAction(
    '[Blog Selection] Get',
    props<{ showLoadingIndicator: boolean }>()
);

export const getBlogSelectionSuccess = createAction(
    '[Blog Selection] Get Success',
    props<{ blogSelections: SelectedBlog[], hasChanged: boolean }>()
);

export const getBlogSelectionFailed = createAction(
    '[Blog Selection] Get Failed',
    props<{ error: string }>()
);

export const toggleBlogSelection = createAction(
    '[Blog Selection] Toggle',
    props<{ toggledBlogSelection: SelectedBlog }>()
);

export const deleteBlogSelection = createAction(
    '[Blog Selection] Delete',
    props<{ blogSelection: SelectedBlog }>()
);