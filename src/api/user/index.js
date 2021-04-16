import axios from "../axios";
import {serverUrl} from "../../config";

export const login =  (params) => axios.post(serverUrl + 'login', params);
export const logout = () =>  axios.get(serverUrl + 'logout')
export const refreshToken = () => axios.get(serverUrl + 'refreshToken');

export const getUserList =  (params) => axios.post(serverUrl + 'user/list', params);
export const createUser = (params) =>  axios.post(serverUrl + 'user/create', params);
export const editUser = (params) =>  axios.post(serverUrl + 'user/edit', params);
export const deleteUser = (params) =>  axios.post(serverUrl + 'user/delete', params);