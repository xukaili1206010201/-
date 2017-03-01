'use strict';

var personalService = angular.module('personalService', []);

personalService.factory('personalService', function($http, commonService) {

  var service = { // our factory definition

    getIOSInfo : function(params) {
      var url = commonService.getBaseParams().url + 'getIOSInfo.action';
      return $http.get(url, params);
    },

    getIOSSyncInfo : function(params) {
      var url = commonService.getBaseParams().url + 'getIOSInfo.action';
      return commonService.handleSyncData(url, params);
    },

    memberLogin : function(params) {
      var url = commonService.getBaseParams().url + 'memberLogin.action';
      return $http.post(url, params);
    },

    memberRegister : function(params) {
      var url = commonService.getBaseParams().url + 'memberRegister.action';
      return $http.post(url, params);
    },

    getSMSCode : function(params) {
      var url = commonService.getBaseParams().url + 'getSMSCode.action';
      return $http.post(url, params);
    },

    editPassword : function(params) {
      var url = commonService.getBaseParams().url + 'editPassword.action';
      return $http.post(url, params);
    },

    editUserInfo : function(params) {
      var url = commonService.getBaseParams().url + 'editUserInfo.action';
      return $http.post(url, params);
    },

    queryDetailBy : function(params) {
      var url = commonService.getBaseParams().url + 'datas/audio/workset/detail';
      return $http.post(url, params);
    },

    queryDetailSyncBy : function(params) {
      var url = commonService.getBaseParams().url + 'datas/audio/workset/detail';
      return commonService.handleSyncData(url, params);
    },

    save : function(params) {
      var url = commonService.getBaseParams().url + 'datas/audio/workset/save';
      return $http.post(url, params);
    },

    saveSync : function(params) {
      var url = commonService.getBaseParams().url + 'datas/audio/workset/save';
      return commonService.handleSyncData(url, params);
    }
  };
  return service;

});
