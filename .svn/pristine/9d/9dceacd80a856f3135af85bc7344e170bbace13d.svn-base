'use strict';

var appRoute = angular.module('appRoute',
    [
      'ngRoute',
      'ui.router',
      'personalModuleRoute',
      'orderModuleRoute',
      'aboutModuleRoute',
      'communityModuleRoute',
      'businessModuleRoute',
      'cartModuleRoute',
      'guanjiaModuleRoute',
      'serviceModuleRoute',
      'couponsModuleRoute',
      'messageModuleRoute',
      'welfareRoute',
      'societyRoute',
      'activitiesRoute',
      'reserveRoute'
    ]);

appRoute.config(
    function ($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('error', {
            url: '/error.htm',
            templateUrl: 'error.html',
            controller: 'notFoundCtrl'
          });
      var dateTime=new Date().getTime();
      $urlRouterProvider
          .otherwise("/guanjia/comservice.htm?t="+dateTime);
    });
