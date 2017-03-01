'use strict';

var serviceModuleRoute = angular.module('serviceModuleRoute', ['ngRoute', 'ui.router', 'authService']);

serviceModuleRoute.config(function ($stateProvider) {
  $stateProvider
      .state('service-purchase', {
        url: '/service/purchase.htm/:operate',
        templateUrl: 'modules/service/views/purchase.html',
        controller: 'purchaseCtrl',
        params: {
          obj: null
        }
      })
      .state('service-goodsDetail', {
        url: '/service/goodsDetail.htm?target&goods_id',
        templateUrl: 'modules/service/views/goodsDetail.html',
        controller: 'goodsDetailCtrl'
      })
      .state('service-selectStation', {
        url: '/service/selectStation.htm:operate',
        templateUrl: 'modules/service/views/selectStation.html',
        controller: 'selectStationCtrl',
        params: {
          obj: null
        }
      })
      .state('service-goodsPreview', {
        url: '/service/goodsPreview.htm?id',
        templateUrl: 'modules/service/views/goodsPreview.html',
        controller: 'goodsPreviewCtrl'
      })
      .state('service-mycommunityselect', {
        url: '/service/mycommunityselect:operate',
        templateUrl: 'modules/service/views/mycommunityselect.html',
        controller: 'mycommunityselectCtrl',
        params: {
          obj: null
        }
      }).state('service-share', {
    url: '/service/share.htm?goodsIds',
    templateUrl: 'modules/service/views/share.html',
    controller: 'shareGoodsCtrl'
  }).state('service-payCompletion', {
    url: '/service/payCompletion.htm',
    templateUrl: 'modules/service/views/payCompletion.html',
    controller: 'payCompletionCtrl'
  });
});
