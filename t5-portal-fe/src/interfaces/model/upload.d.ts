import { UploadFile } from "antd/lib/upload/interface";

export interface UploadResponse {
    url: string;
}

export interface EventArgs<T = UploadResponse> {
    file: UploadFile<T>;
    fileList: Array<UploadFile<T>>;
}
