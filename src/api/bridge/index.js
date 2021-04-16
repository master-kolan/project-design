import axios from "../axios";
import {serverUrl} from "../../config";

export const execProcess =  () => axios.post(serverUrl + 'bridge/exec');
export const getBridgeList =  (params) => axios.post(serverUrl + 'bridge/list', params);
export const createBridge = (params) =>  axios.post(serverUrl + 'bridge/create', params);
export const editBridge = (params) =>  axios.post(serverUrl + 'bridge/edit', params);
export const deleteBridge = (params) =>  axios.post(serverUrl + 'bridge/delete', params);