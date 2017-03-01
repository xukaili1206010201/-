'use strict';

var messageModuleRoute = angular.module('messageModuleRoute', ['ngRoute', 'ui.router', 'authService']);

messageModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-message', {
      url: '/member/message.htm/?from',
      templateUrl: 'modules/member/user/message/view/usermessage.html',
      controller: 'userMessageCtrl'
    });
});

messageModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-messagedetail', {
      url: '/member/messagedetail.htm/:messageId',
      templateUrl: 'modules/member/user/message/view/messagedetail.html',
      controller: 'messageDetailCtrl'
    });
});
