'use strict';

var communityModuleRoute = angular.module('communityModuleRoute', ['ngRoute', 'ui.router', 'authService']);

communityModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-selectcity', {
      url: '/member/selectcity.htm',
      templateUrl: 'modules/member/user/community/view/selectcity.html',
      controller: 'selectcityCtrl'
    })

    .state('member-user-selectcommunity', {
      url: '/member/selectcommunity.htm/:operate',
      templateUrl: 'modules/member/user/community/view/selectcommunity.html',
      controller: 'selectCommunityCtrl',
      params:{
        obj : null
      }
    })

    .state('member-user-mycommunity', {
      url: '/member/mycommunity.htm/:from',
      templateUrl: 'modules/member/user/community/view/mycommunity.html',
      controller: 'myCommunityCtrl'
    })

    .state('member-user-test', {
      url: '/member/mycommunitypro.htm',
      templateUrl: 'view/mycommunity.html',
      controller: 'myCommunityProCtrl'
    })

    .state('member-user-mycommunityset', {
      url: '/member/mycommunityset.htm/:operate',
      templateUrl: 'modules/member/user/community/view/myHouse_set.html',
      controller: 'myCommunitySetCtrl',
      params:{
        obj : null
      }
    });
});
