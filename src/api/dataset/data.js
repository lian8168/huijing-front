import request from '@/utils/request'

// 查询数据标注列表
export function listData(query) {
  return request({
    url: '/dataset/data/list',
    method: 'get',
    params: query
  })
}

// 查询数据标注详细
export function getData(dataId) {
  return request({
    url: '/dataset/data/' + dataId,
    method: 'get'
  })
}

// 新增数据标注
export function addData(data) {
  return request({
    url: '/dataset/data',
    method: 'post',
    data: data
  })
}

// 上传数据标注
export function uploadData(data) {
  return request({
    url: '/dataset/data/upload',
    method: 'post',
    data: data
  })
}

// 修改数据标注
export function updateData(data) {
  return request({
    url: '/dataset/data',
    method: 'put',
    data: data
  })
}

// 删除数据标注
export function delData(dataId) {
  return request({
    url: '/dataset/data/' + dataId,
    method: 'delete'
  })
}
