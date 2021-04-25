export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            authority: ['admin', 'user'],
            routes: [
              {
                path: '/',
                redirect: '/lists',
              },
              {
                name: 'list.table-list',
                icon: 'table',
                path: '/lists',
                component: './TableList',
              },
              {
                name: 'list.good-list',
                icon: 'smile',
                path: '/items',
                component: './GoodsList',
              },
              {
                name: 'list.area-list',
                icon: 'crown',
                path: '/block',
                component: './AreaList',
              },
              {
                name: 'list.error-list',
                icon: 'container',
                path: '/errorList',
                component: './ErrorList',
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
