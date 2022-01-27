import { createAction, props } from '@ngrx/store';
import { SelectedBlog } from 'src/app/services/SelectedBlog';

export const addBlogSelection = createAction(
    '[Blog Selection] Add',
    props<{ blogSelection: SelectedBlog }>()
);

export const getBlogSelection = createAction(
    '[Blog Selection] Get'
);

export const getBlogSelectionSuccess = createAction(
    '[Blog Selection] Get Success',
    props<{ blogSelections: SelectedBlog[] }>()
);

export const getBlogSelectionFailed = createAction(
    '[Blog Selection] Get Failed',
    props<{ error: string }>()
);