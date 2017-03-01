'use strict';

var payCacheService = angular.module('payCacheService', []);

//通用服务方法
payCacheService.factory('payCacheService',
    function ($http, $state, $q, $uibModal) {

      var payInfo = {};
        /**
         * 定义传递数据的setter函数
         * @param {type} xxx
         * @returns {*}
         * @private
         */
        var _setter = function (data) {
          payInfo = data;
          var payInfoStr = JSON.stringify(payInfo);
            localStorage.payInfo = payInfoStr;
        };

        /**
         * 定义获取数据的getter函数
         * @param {type} xxx
         * @returns {*}
         * @private
         */
        var _getter = function () {
            var payInfoStr = localStorage.payInfo;
            var dict = JSON.parse(payInfoStr);
            return dict;
        };

        var _setProperty = function (key, value) {
            payInfo[key] = value
            var payInfoStr = JSON.stringify(payInfo);
            localStorage.payInfo = payInfoStr;
        }

        var _getProperty = function (key) {
            var payInfoStr = localStorage.payInfo;
            var dict = JSON.parse(payInfoStr);
            var value = dict[key];
            return value
        }

        var _removeAllItem = function () {
          payInfo = {};
          localStorage.removeItem('payInfo');
        }
        // Public APIs
        // 在controller中通过调setter()和getter()方法可实现提交或获取参数的功能
        return {
            setter: _setter,
            getter: _getter,
            setProperty: _setProperty,
            getProperty: _getProperty,
            removeAllItem: _removeAllItem
        };

    }
);

