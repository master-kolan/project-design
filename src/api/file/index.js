import axios from "../axios";
import {serverUrl} from "../../config";

export const getFileList =  (params) => axios.post(serverUrl + 'file/list', params);
export const uploadFile = (data) => {
    const param = new FormData();
    param.append("file",data);
    return  axios.post(serverUrl + 'file/upload',param, {
        headers: { "Content-Type": "multipart/form-data" }
    });
}
export const createFile = (params) =>  axios.post(serverUrl + 'file/create', params);
export const editFile = (params) =>  axios.post(serverUrl + 'file/edit', params);
export const deleteFile = (params) =>  axios.post(serverUrl + 'file/delete', params);