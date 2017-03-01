'use strict';

var teacherService = angular.module('teacherService', []);

teacherService.factory('teacherService', function($http, commonService) {

  var service = { // our factory definition

    queryListBy : function(params) {
      var url = commonService.getBaseParams().url + 'datas/teacher/list.json';
      return $http.get(url, params);
    },

    queryListSyncBy : function(params) {
      var url = commonService.getBaseParams().url + 'datas/teacher/list.json';
      return commonService.handleSyncData(url, params);
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
