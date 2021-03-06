var societyRoute = angular.module('societyRoute',[]);

societyRoute.config(function($stateProvider){

  $stateProvider
    .state('society-Neighborhood', {
      url: '/society/society.htm',
      templateUrl: 'modules/society/views/society.html',
      controller: 'societyCtrl'
    })
    .state('society-tribe',{
      url: '/society/societyTribe.htm?buluoId&from',
      templateUrl: 'modules/society/views/societyTribe.html',
      controller: 'tribeCtrl'
    })
    .state('society-postdetail',{
      url: '/society/postDetail.htm?bbsId',
      templateUrl: 'modules/society/views/postDetail.html',
      controller: 'postCtrl'
    })
    .state('society-postedit',{
      url: '/society/postEdit.htm?bbsId&buluoId&from',
      templateUrl: 'modules/society/views/postEdit.html',
      controller: 'EditCtrl'
    })
    .state('society-postreply',{
      url: '/society/postReply.htm?title&bbsId&bbsReplyId',
      templateUrl: 'modules/society/views/postReply.html',
      controller: 'replyCtrl'
    });
});
