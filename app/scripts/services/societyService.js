'use strict';

var societyService = angular.module('societyService', []);

societyService.factory('societyService', function($http, commonService) {

  var service = { // our factory definition

    //部落列表
    listBuluo : function(params) {
      var url = commonService.getBaseParams().url + 'listBuluo.action';
      return $http.post(url, params);
    },
    //帖子列表
    listBBS : function(params) {
      var url = commonService.getBaseParams().url + 'listBBS.action';
      return $http.post(url, params);
    },
    //帖子详情
    getBBS : function(params) {
      var url = commonService.getBaseParams().url + 'getBBS.action';
      return $http.post(url, params);
    },
    //回帖列表
    listBBSReply : function(params) {
      var url = commonService.getBaseParams().url + 'listBBSReply.action';
      return $http.post(url, params);
    },
    //发/回复帖子
    editBBS : function(params) {
      var url = commonService.getBaseParams().url + 'editBBS.action';
      return $http.post(url, params);
    },
    //回帖
    replyBBS : function(params) {
      var url = commonService.getBaseParams().url + 'replyBBS.action';
      return $http.post(url, params);
    },

    //删除帖子
    delBBS : function(params) {
      var url = commonService.getBaseParams().url + 'delBBS.action';
      return $http.post(url, params);
    }

  };
  return service;

});
