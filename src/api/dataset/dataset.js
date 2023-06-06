import request from '@/utils/request'

// 查询数据集列表
export function listDataset(query) {
  return request({
    url: '/dataset/dataset/list',
    method: 'get',
    params: query
  })
}

// 根据用户id查询数据集列表
export function listDatasetByUserId(userId) {
  return request({
    url: '/dataset/dataset/list/' + userId,
    method: 'get',
  })
}

// 查询数据集详细
export function getDataset(datasetId) {
  return request({
    url: '/dataset/dataset/' + datasetId,
    method: 'get'
  })
}

// 新增数据集
export function addDataset(data) {
  return request({
    url: '/dataset/dataset',
    method: 'post',
    data: data
  })
}

// 修改数据集
export function updateDataset(data) {
  return request({
    url: '/dataset/dataset',
    method: 'put',
    data: data
  })
}

// 删除数据集
export function delDataset(datasetId) {
  return request({
    url: '/dataset/dataset/' + datasetId,
    method: 'delete'
  })
}
