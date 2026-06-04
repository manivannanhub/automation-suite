import { env } from '../config/env.js';

/**
 * @param {import('@playwright/test').APIRequestContext} request
 */
export function listTodos(request) {
  return request.get(`${env.baseURL}/api/todos`);
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 */
export function getTodoStats(request) {
  return request.get(`${env.baseURL}/api/todos/stats`);
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {{ title: string }} data
 */
export function createTodo(request, data) {
  return request.post(`${env.baseURL}/api/todos`, { data });
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {number} id
 * @param {{ title?: string, completed?: boolean }} data
 */
export function updateTodo(request, id, data) {
  return request.put(`${env.baseURL}/api/todos/${id}`, { data });
}

/**
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {number} id
 */
export function deleteTodo(request, id) {
  return request.delete(`${env.baseURL}/api/todos/${id}`);
}
