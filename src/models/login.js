import { stringify } from 'querystring';
import { history } from 'umi';
import { fakeAccountLogin, fakeAccountRegister, fakeAccountLogout } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { message } from 'antd';
const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      }); // Login successfully

      if (response.isSuccess === true) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        message.success('🎉 🎉 🎉  登录成功！');
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }

        history.replace(redirect || '/');
      } else {
        message.error(response.message);
      }
    },
    *register({ payload }, { call, put }) {
      const response = yield call(fakeAccountRegister, payload);
      // yield put({
      //   type: 'changeLoginStatus',
      //   payload: response,
      // }); // Login successfully

      if (response.isSuccess === true) {
        // const urlParams = new URL(window.location.href);
        // const params = getPageQuery();
        message.success('🎉 🎉 🎉  注册成功！');
        // let { redirect } = params;

        // if (redirect) {
        //   const redirectUrlParams = new URL(redirect);

        //   if (redirectUrlParams.origin === urlParams.origin) {
        //     redirect = redirect.substr(urlParams.origin.length);

        //     if (redirect.match(/^\/.*#/)) {
        //       redirect = redirect.substr(redirect.indexOf('#') + 1);
        //     }
        //   } else {
        //     window.location.href = '/';
        //     return;
        //   }
        // }

        history.replace(redirect || '/');
      }
    },
    *logout({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogout, payload);
      const { redirect } = getPageQuery(); // Note: There may be security issues, please note

      if (window.location.pathname !== '/user/login' && !redirect && response.isSuccess === true) {
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return { ...state, status: 'ok', type: payload.type };
    },
  },
};
export default Model;
