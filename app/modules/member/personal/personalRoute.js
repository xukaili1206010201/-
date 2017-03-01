'use strict';

var personalModuleRoute = angular.module('personalModuleRoute', ['ngRoute', 'ui.router', 'authService']);

personalModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-personal-businesscard', {
      url: '/member/businesscard.htm?mobile',
      templateUrl: 'modules/member/personal/views/businesscard.html',
      controller: 'businesscardCtrl'
    })
    .state('member-personal-editUserInfo', {
      url: '/member/editUserInfo.htm?newmobile',
      templateUrl: 'modules/member/personal/views/editUserInfo.html',
      controller: 'editUserInfoCtrl'
    })
    .state('member-personal-login', {
      url: '/member/login.htm?from',
      templateUrl: 'modules/member/personal/views/login.html',
      controller: 'loginCtrl'
    })
    .state('member-personal-mobileset', {
      url: '/member/mobileset.htm?mobile',
      templateUrl: 'modules/member/personal/views/mobileset.html',
      controller: 'mobilesetCtrl'
    })
    .state('member-personal-passwordreset', {
      url: '/member/passwordreset.htm?mobile&from',
      templateUrl: 'modules/member/personal/views/passwordreset.html',
      controller: 'passwordresetCtrl'
    })
    .state('member-personal-register', {
      url: '/member/register.htm?mobile&from',
      templateUrl: 'modules/member/personal/views/register.html',
      controller: 'registerCtrl'
    })

    .state('member-personal-usercenter', {
      url: '/member/usercenter.htm',
      templateUrl: 'modules/member/usercenter.html',
      controller: 'userCenterCtrl'
    })
    .state('member-personal-usercenterNo', {
      url: '/member/usercenterNo.htm',
      templateUrl: 'modules/member/usercenterNo.html',
      controller: 'userCenterNoCtrl'
    })

});
