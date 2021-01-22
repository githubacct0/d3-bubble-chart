export interface NodeParentModel {
    color: string;
    element: string;
    id: number;
    name: string;
    progress: boolean;
    shortname: string;
    size: number;
    children?:any;
}

export interface NodeModel {
    color: string;
    element: string;
    id: number;
    name: string;
    progress: boolean;
    shortname: string;
    size: number;
}