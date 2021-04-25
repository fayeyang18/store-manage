import request from '@/utils/request';
export async function fakeAccountLogin(params) {
  return request('/admin/user/login', {
    method: 'POST',
    data: params,
  });
}
export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function fakeAccountRegister(params) {
  return request('/admin/user/register', {
    method: 'POST',
    data: params,
  });
}

export async function fakeAccountLogout(params) {
  return request('/admin/user/logout', {
    method: 'POST',
    data: {
      userName: 'admin',
    },
  });
}