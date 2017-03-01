'use strict';

var businessModuleRoute = angular.module('businessModuleRoute', ['ngRoute', 'ui.router', 'authService']);

businessModuleRoute.config(function ($stateProvider) {
    $stateProvider
        .state('member-business-delivery', {
            url: '/member/delivery.htm',
            templateUrl: 'modules/member/business/views/delivery.html',
            controller: 'deliveryCtrl'
        })
        .state('member-business-distribute', {
            url: '/member/distribute.htm',
            templateUrl: 'modules/member/business/views/distribute.html',
            controller: 'distributeCtrl'
        })
        .state('member-business-fans_code', {
            url: '/member/fans_code.htm',
            templateUrl: 'modules/member/business/views/fans_code.html',
            controller: 'fans_codeCtrl'
        })
          .state('member-business-portfolio', {
          url: '/member/portfolio.htm',
          templateUrl: 'modules/member/business/views/portfolio.html',
          controller: 'portfolioCtrl'
        });
});
