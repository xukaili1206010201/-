'use strict';

var interceptor = angular.module('interceptor', []);

//拦截器
interceptor.factory('httpInterceptor',
    function ($q, $rootScope, $injector, AUTH_EVENTS) {

      var httpInterceptor = {

        'requestError': function (request) {
          return request
        },

        'request': function (config) {

          $('#loading-bar').css({
            'display': 'block'
          });

          //头信息处理
          config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

          //TODO 另一种权限方案，使用token令牌，统一加密处理

          //字符集处理
          config.transformRequest = [function (data) {

            var param = function (obj) {
              var query = '';
              var name, value, fullSubName, subName, subValue, innerObj, i;

              for (name in obj) {
                //noinspection JSUnfilteredForInLoop
                value = obj[name];

                if (value instanceof Array) {
                  for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value instanceof Object) {
                  for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                  }
                } else if (value !== undefined && value !== null) {
                  query += encodeURIComponent(name) + '='
                      + encodeURIComponent(value) + '&';
                }
              }

              return query.length ? query.substr(0, query.length - 1)
                  : query;
            };

            return angular.isObject(data)
            && String(data) !== '[object File]' ? param(data)
                : data;
          }];

          //开启进度条
          return config
        },

        'responseError': function (response) {
          $rootScope.$broadcast({
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
          }[response.status], response);

          return $q.reject(response);
        },

        'response': function (response) {
          //关闭进度条
          $('#loading-bar').css('display', 'none');
          if (response.data.code == '-10') {
            window.location.href = '/#/error.htm';
            $rootScope.errorMsg = response.data.data.maintenance_message;
            $rootScope.maintenance_date = response.data.data.maintenance_date;
            return false;
          }
          return response;
        }
      };

      return httpInterceptor;
    }
);
