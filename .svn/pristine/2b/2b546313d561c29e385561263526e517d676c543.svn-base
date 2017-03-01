'use strict';

var reserveCacheService = angular.module('reserveCacheService', []);

//通用服务方法
reserveCacheService.factory('reserveCacheService',
  function ($http, $state, $q, $uibModal) {

    //定义参数对象
    var reserveServiceInfo = {};

    /**
     * 定义传递数据的setter函数
     * @param {type} xxx
     * @returns {*}
     * @private
     */
    var _setter = function (data) {
      reserveServiceInfo = data;
      var serviceServiceInfoStr = JSON.stringify(reserveServiceInfo);
      localStorage.reserveServiceInfo = reserveServiceInfoStr;
    };

    /**
     * 定义获取数据的getter函数
     * @param {type} xxx
     * @returns {*}
     * @private
     */
    var _getter = function () {
      var reserveServiceInfoStr = localStorage.reserveServiceInfo;
      var dict = JSON.parse(reserveServiceInfoStr);
      return dict;
    };

    var _setProperty = function (key,value) {
      reserveServiceInfo[key] = value
      var reserveServiceInfoStr = JSON.stringify(reserveServiceInfo);
      localStorage.reserveServiceInfo = reserveServiceInfoStr;
    }

    var _getProperty = function (key) {
      var reserveServiceInfoStr = localStorage.reserveServiceInfo;
      var value = reserveServiceInfoStr;
      if (reserveServiceInfoStr != "" && reserveServiceInfoStr != undefined){
        value = {};
        var dict = JSON.parse(reserveServiceInfoStr);
        value = dict[key];
      }

      return value
    }

    var _clean = function(){
      localStorage.removeItem('reserveServiceInfo');
    }

    // Public APIs
    // 在controller中通过调setter()和getter()方法可实现提交或获取参数的功能
    return {
      setter: _setter,
      getter: _getter,
      setProperty: _setProperty,
      getProperty: _getProperty,
      clean:_clean
    };

  }
);

