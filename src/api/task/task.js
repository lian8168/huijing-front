import request from '@/utils/request'

// 查询标注任务列表
export function listTask(query) {
  return request({
    url: '/task/task/list',
    method: 'get',
    params: query
  })
}

// 查询标注任务详细
export function getTask(taskId) {
  return request({
    url: '/task/task/' + taskId,
    method: 'get'
  })
}

// 新增标注任务
export function addTask(data) {
  return request({
    url: '/task/task',
    method: 'post',
    data: data
  })
}

// 修改标注任务
export function updateTask(data) {
  return request({
    url: '/task/task',
    method: 'put',
    data: data
  })
}

// 删除标注任务
export function delTask(taskId) {
  return request({
    url: '/task/task/' + taskId,
    method: 'delete'
  })
}
