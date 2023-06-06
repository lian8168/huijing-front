import request from '@/utils/request'

// 查询标注团队列表
export function listTeam(query) {
  return request({
    url: '/team/team/list',
    method: 'get',
    params: query
  })
}

// 查询标注团队详细
export function getTeam(teamId) {
  return request({
    url: '/team/team/' + teamId,
    method: 'get'
  })
}

// 新增标注团队
export function addTeam(data) {
  return request({
    url: '/team/team',
    method: 'post',
    data: data
  })
}

// 修改标注团队
export function updateTeam(data) {
  return request({
    url: '/team/team',
    method: 'put',
    data: data
  })
}

// 删除标注团队
export function delTeam(teamId) {
  return request({
    url: '/team/team/' + teamId,
    method: 'delete'
  })
}
