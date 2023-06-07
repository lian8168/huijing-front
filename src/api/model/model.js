import request from '@/utils/request'

// 查询模型管理列表
export function listModel(query) {
  return request({
    url: '/model/model/list',
    method: 'get',
    params: query
  })
}

// 查询模型管理详细
export function getModel(modelId) {
  return request({
    url: '/model/model/' + modelId,
    method: 'get'
  })
}

// 新增模型管理
export function addModel(data) {
  return request({
    url: '/model/model',
    method: 'post',
    data: data
  })
}

// 修改模型管理
export function updateModel(data) {
  return request({
    url: '/model/model',
    method: 'put',
    data: data
  })
}

// 删除模型管理
export function delModel(modelId) {
  return request({
    url: '/model/model/' + modelId,
    method: 'delete'
  })
}
