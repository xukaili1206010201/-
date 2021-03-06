'use strict';

var couponsModuleRoute = angular.module('couponsModuleRoute', ['ngRoute', 'ui.router', 'authService']);

couponsModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-mycoupons', {
      url: '/member/mycoupons.htm',
      templateUrl: 'modules/member/user/coupons/view/mycoupons.html',
      controller: 'myCouponsCtrl'
    })

    .state('member-user-coupondetail', {
      url: '/member/coupondetail.htm?couponsId',
      templateUrl: 'modules/member/user/coupons/view/coupondetail.html',
      controller: 'couponDetailCtrl'
    })
    .state('member-user-couponsseller',{
      url: '/member/couponsseller.htm?couponsId',
      templateUrl: 'modules/member/user/coupons/view/couponsseller.html',
      controller: 'couponsSellerCtrl'
    });
});
