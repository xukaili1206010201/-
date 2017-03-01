/**
 * Created by crazybear on 16/4/21.
 */
'use strict';

var cartModuleRoute = angular.module('cartModuleRoute', ['ngRoute', 'ui.router', 'authService']);

cartModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-cart', {
      url: '/member/cart.htm/:from',
      templateUrl: 'modules/member/user/cart/view/cart.html',
      controller: 'cartCtrl'
    });
});
