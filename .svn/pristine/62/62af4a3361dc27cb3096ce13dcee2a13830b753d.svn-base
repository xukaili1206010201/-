/**
 * Created by crazybear on 16/4/20.
 */
'use strict';

var orderModuleRoute = angular.module('orderModuleRoute', ['ngRoute', 'ui.router', 'authService']);

orderModuleRoute.config(function ($stateProvider) {
  $stateProvider
    .state('member-user-myorder', {
      url: '/member/myorder.htm/:from',
      templateUrl: 'modules/member/user/order/view/myorder.html',
      controller: 'myOrderCtrl'
    })

    .state('member-user-productjudge', {
      url: '/member/productjudge.htm/:goodId',
      templateUrl: 'modules/member/user/order/view/product-judge.html',
      controller: 'goodsJudgeCtrl',
      params:{
        goodDetail : null
      }
    })
    .state('member-user-orderdetail',{
      url : '/member/orderdetail.htm?orderId&from&type',
      templateUrl : 'modules/member/user/order/view/orderdetail.html',
      controller : 'orderDetailCtrl'
    });

});
