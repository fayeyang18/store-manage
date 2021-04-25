import request from '@/utils/request';
export async function queryRule(params) {
  console.log('params', params)
  const data = await request('/admin/order/paging', {
    method: 'POST',
    data: params,
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
  return request('/admin/order/create', {
    method: 'POST',
    data: { ...params },
  });
}
export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}

export async function warehouseOrder(id) {
  return request(`/admin/order/warehousing?id=${id}`, {
    method: 'GET',
  });
}

export async function deliveryOrder(id) {
  return request(`/admin/order/delivery?id=${id}`, {
    method: 'GET',
  });
}
