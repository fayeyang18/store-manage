import request from '@/utils/request';
export async function queryRule(params) {
  let url = '/admin/commodity/paging?';
  const param = Object.keys(params);
  param.forEach(item => {
    if (params[item]) url = `${url}&${item}=${params[item]}`});
  console.log('url', url)
  const data = await request(url, {
    method: 'GET',
  });
  const result = {
    data: data.result,
    total: data.result.length,
    success: data.isSuccess,
    pageSize: params.limit,
    current: params.offset || 1,
  }
  return result;
}
export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addRule(params) {
  return request('/admin/commodity/create', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRule(params) {
  return request('/admin/commodity/update', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}

export async function onShelves(params) {
  return request('/admin/commodity/onShelves', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function outShelves(params) {
  return request('/admin/commodity/outShelves', {
    method: 'DELETE',
    data: { ...params },
  });
}

export async function exportRule(params) {
  return request('/admin/commodity/OutExcel', {
    method: 'GET',
    data: { ...params, method: 'update' },
  });
}


export async function getBlockList(params) {
  return request('/admin/block/list', {
    method: 'GET',
    data: { ...params },
  });
}
