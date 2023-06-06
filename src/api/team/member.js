import request from '@/utils/request'

// 查询团队成员列表
export function listMember(query) {
  return request({
    url: '/team/member/list',
    method: 'get',
    params: query
  })
}

// 查询团队成员详细
export function getMember(memberId) {
  return request({
    url: '/team/member/' + memberId,
    method: 'get'
  })
}

// 新增团队成员
export function addMember(data) {
  return request({
    url: '/team/member',
    method: 'post',
    data: data
  })
}

// 修改团队成员
export function updateMember(data) {
  return request({
    url: '/team/member',
    method: 'put',
    data: data
  })
}

// 删除团队成员
export function delMember(memberId) {
  return request({
    url: '/team/member/' + memberId,
    method: 'delete'
  })
}
