/**
 * Created by 印聪 on 16/6/22.
 */
'use strict';

var activitiesModuleRoute = angular.module('reserveRoute', ['ngRoute', 'ui.router', 'authService']);

activitiesModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-reserve', {
      url: '/member/reserve.htm',
      templateUrl: 'modules/member/user/reserve/view/reserve.html',
      controller: 'reserveCtrl'
    });
});
