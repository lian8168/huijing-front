import request from '@/utils/request'

// 查询训练任务列表
export function listTrain(query) {
  return request({
    url: '/model/train/list',
    method: 'get',
    params: query
  })
}

// 查询训练任务详细
export function getTrain(trainId) {
  return request({
    url: '/model/train/' + trainId,
    method: 'get'
  })
}

// 新增训练任务
export function addTrain(data) {
  return request({
    url: '/model/train',
    method: 'post',
    data: data
  })
}

// 修改训练任务
export function updateTrain(data) {
  return request({
    url: '/model/train',
    method: 'put',
    data: data
  })
}

// 删除训练任务
export function delTrain(trainId) {
  return request({
    url: '/model/train/' + trainId,
    method: 'delete'
  })
}
