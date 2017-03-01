var welfareRoute = angular.module('welfareRoute',['ui.router']);

welfareRoute.config(function($stateProvider){
  $stateProvider
    .state('welfare-seller', {
      url: '/welfare/sellerWelfare.htm',
      templateUrl: 'modules/welfare/views/sellerWelfare.html',
      controller: 'welfareCtrl'
    })
});
