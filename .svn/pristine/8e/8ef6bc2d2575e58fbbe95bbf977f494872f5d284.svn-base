'use strict';

var activitiesModuleRoute = angular.module('activitiesRoute', ['ngRoute', 'ui.router', 'authService']);

activitiesModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-myactivities', {
      url: '/member/myactivities.htm',
      templateUrl: 'modules/member/user/activities/view/myactivities.html',
      controller: 'myactivitiesCtrl'
    })
    .state('member-user-callactivity',{
      url : '/member/callactivity.htm',
      templateUrl : 'modules/member/user/activities/view/callactivity.html',
      controller : 'activityCtrl'
    })
    .state('member-user-activitydetail',{
      url : '/member/activitydetail.htm?activityId&from',
      templateUrl : 'modules/member/user/activities/view/activitydetail.html',
      controller : 'activityDetailCtrl'
    })

});
