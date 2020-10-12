export enum ServiceResultStatus {
    STARTED,
    FINISHED
}

export interface ServiceResult<T> {
    status: ServiceResultStatus,
    content: T;
}