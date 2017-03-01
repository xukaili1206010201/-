'use strict';

var aboutModuleRoute = angular.module('aboutModuleRoute', ['ngRoute', 'ui.router', 'authService']);

aboutModuleRoute.config(function ($stateProvider) {
  $stateProvider
      .state('member-about-followus', {
        url: '/member/followus.htm',
        templateUrl: 'modules/member/about/views/followus.html',
        cache: false,
        controller: 'followUsCtrl'
      })
      .state('member-about-contactus', {
        url: '/member/contactus.htm',
        templateUrl: 'modules/member/about/views/contactus.html',
        controller: 'contactUsCtrl'
      })

      .state('member-about-stationintro', {
        url: '/member/stationintro.htm?fuwu_id',
        templateUrl: 'modules/member/about/views/stationintro.html',
        controller: 'stationIntroCtrl'
      })
      .state('member-about-stationdetail', {
        url: '/member/stationdetail.htm?station_id&lat&lon',
        templateUrl: 'modules/member/about/views/stationdetail.html',
        controller: 'stationDetailCtrl'
      }).state('member-serviceno', {
    url: '/member/serviceno.htm',
    templateUrl: 'modules/member/about/views/serviceNo.html',
    controller: 'serviceNoCtrl'
  });

});
