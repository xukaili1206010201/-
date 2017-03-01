/**
 * Created by 印聪 on 16/6/22.
 */
'use strict';

var activitiesModuleController = angular.module('activitiesController', []);

//活动召集页
activitiesModuleController.controller('activityCtrl', ['$scope', '$state', 'guanjiaService', 'userService', '$cookies', '$rootScope', '$q', function ($scope, $state, guanjiaService, userService, $cookies, $rootScope, $q) {
  $scope.params = {
    'city_id': sessionStorage.gpscityId,
    'url': 'listActivity.action',
    'pageno': '1',
    'pagesize': '10',
    'direction': 'up',
    'key': ''
  };
  //请求定位接口
  var promise = guanjiaService.usercitySelect();
  promise.then(function (data) {
    //首次进入；未登录状态；切换登录状态；在登录状态时，手动选择城市
    if (!sessionStorage.gpscityId || sessionStorage.cityListChange == 'true' && !$cookies.get('ticket')) {
      //本地存储定位信息
      sessionStorage.setItem("gpscityName", data.name);
      sessionStorage.setItem("gpscityId", data.city_id);
    }
    //判断用户是否登录
    if ($cookies.get('ticket')) {
      $scope.usercityId = sessionStorage.gpscityId;
    } else {
      $scope.usercityName = sessionStorage.gpscityName;
    }


    //************************************ 控制器内容 ************************************
    //返回首页
    $scope.backtocomservice = function () {
      var val = $('.search-input').val();
      if (val != '') {
        $('.search-input').val('');
        $scope.searchActivity();
        return;
      }
      if ($cookies.get('from') == '%guanggao%') {
        $state.go(localStorage.adRoute);
      }
      if ($cookies.get('from') == '%comservice%') {
        $state.go('guanjia-comservice');
      }

    };


    //活动召集列表
    $scope.listActivity = [];
    var isOver = false; // false:标志数据未加载完成
    $scope.errMsg = '';
    $scope.getActivityList = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        switch (response.code) {
          case '0':
            var tempList = response.data;
            if (tempList.length == 0 && params.pageno == '1') {
              $scope.errMsg = '没有相关数据';
            } else {
              $scope.errMsg = '';
            }
            if (tempList.length < params.pagesize) {
              isOver = true;
              defer.resolve(isOver);
            } else {
              isOver = false;
              defer.resolve(isOver);
            }
            if (params.direction == 'down') {
              $scope.listActivity = response.data;
            } else {
              $scope.listActivity = $scope.listActivity.concat(tempList);
            }
            break;
          case '-1':
            console.log('参数为空');
            break;
          case '-2':
            console.log('参数错误');
            break;
        }

      });
      return defer.promise;
    };

    $scope.getActivityList($scope.params);

    /***********关键字搜索***************/
    $scope.searchActivity = function () {
      $scope.listActivity = [];
      $scope.params.pageno = 1;
      $scope.params.key = $('.search-input').val();
      $scope.getActivityList($scope.params);
    };
    //失去焦点，获取key的值
    $scope.activityBlur = function () {
      $scope.params.key = $('.search-input').val();
    };

    //跳转到活动详情页
    //从某个页面跳转到活动详情
    //from = 0 活动召集页
    //from = 1 我报名的活动页
    $scope.goDetail = function (activityId) {
      sessionStorage.activityId = activityId;
      $state.go('member-user-activitydetail', {
        'activityId': activityId,
        'from': '0'
      });
    };

  })


}]);

//活动详情页
activitiesModuleController.controller('activityDetailCtrl', ['$scope', 'guanjiaService', 'commonService', '$stateParams', '$rootScope', '$state', '$location', '$cookies', '$timeout', '$filter',
  function ($scope, guanjiaService, commonService, $stateParams, $rootScope, $state, $location, $cookies, $timeout, $filter) {

    $scope.activityId = $stateParams.activityId;
    $scope.form = $stateParams.from;
    var btnHide = function () {
      $scope.activityStart = false;
      $scope.activityEnd = false;
      $scope.activityEnter = false;
      $scope.activityOut = false;
    }
    btnHide();
    //活动召集详情
    guanjiaService.getActivity({
      'ticket': $cookies.get('ticket'),
      'activity_id': $scope.activityId
    }).success(function (response) {
      switch (response.code) {
        case '0':
          $scope.activityDetail = response.data;
          $scope.jiemuList = $scope.activityDetail.jiemuArray;

          //底部显示 -- 是否可以报名/取消报名
          //当前时间
          var nowTime = $filter('date')(new Date(), 'yyyy/MM/dd');
          //报名开始日
          var startDate = $filter('date')($scope.activityDetail.baoming_start_date, 'yyyy/MM/dd');
          //报名结束日
          var endDate = $filter('date')($scope.activityDetail.baoming_end_date, 'yyyy/MM/dd');

          if (nowTime < startDate) {
            $scope.activityStart = true;
          } else if (nowTime >= startDate && nowTime <= endDate) {
            if ($scope.activityDetail.isBaoming == '1') { //未报名
              $scope.activityEnter = true;
            } else { //已报名
              $scope.activityOut = true;
            }

          } else if (nowTime > endDate) {
            $scope.activityEnd = true;
          }

          break;
        case '-1':
          console.log('参数为空');
          break;
        case '-2':
          console.log('参数错误');
          break;
      }

    });

    //活动报名
    $scope.activityApply = function (valid) {
      $scope.valid = valid;  // 0 未报名   1 已报名
      if ($cookies.get('ticket') == null) {
        $('.modal-backdrop').hide();
        $state.go('member-personal-login', {
          'from': '3'
        });
        sessionStorage.loginLocation = $location.path();
        sessionStorage.loginValue = $location.search.activityId;
      } else {
        guanjiaService.activityApply({
          'ticket': $cookies.get('ticket'),
          'activity_id': $scope.activityId,
          'mobile': $scope.mobile,
          'valid': $scope.valid
          //'user_community_id'
        }).success(function (response) {
          switch (response.code) {
            case '0':
              btnHide();
              if ($scope.valid == 0) { //未报名
                commonService.showSuccessMessage('报名成功！');
                $scope.activityEnter = false;
                $scope.activityOut = true;
              } else if ($scope.valid == 1) { //已报名
                commonService.showSuccessMessage('取消报名成功！');
                $scope.activityEnter = true;
                $scope.activityOut = false;
              }

              break;
            case '-1':
              console.log('参数为空');
              break;
            case '-2':
              console.log('参数错误');
              break;
            case '-3':
              if ($scope.valid == 0) {
                commonService.showWarnMessage('已经报名！');
              } else if ($scope.valid == 1) {
                commonService.showWarnMessage('未报名！');
              }
              break;
            case '-4':
              0
              commonService.showWarnMessage('活动报名已经结束啦！');
              break;
            case '-8':
              $state.go('member-personal-login', {
                'from': '3'
              });
              break;
          }

        });

      }

    };

    //返回某个页面
    //from = 0 活动召集页
    //from = 1 我报名的活动页
    $scope.activitydetailBack = function () {
      if ($scope.form == '1') {//我报名的活动页
        $state.go('member-user-myactivities')
      } else {//活动召集页或登录

        if ($cookies.get('from') == '%guanggao%' || $scope.form == 101) {
          $state.go(localStorage.adRoute);
        } else {
          $state.go('member-user-callactivity')
        }

      }
    };
  }]);

//我报名的活动
activitiesModuleController.controller('myactivitiesCtrl', ['$scope', 'userService', 'commonService', '$state', '$q', function ($scope, userService, commonService, $state, $q) {

  //返回到个人中心
  $scope.backCenter = function () {
    var val = $('.search-input').val();
    if (val != '') {
      $('.search-input').val('');
      $scope.searchActivity();
      return;
    }
    $state.go('member-personal-usercenter');
  };

  $scope.activityParams = {
    'pageno': '1',
    'pagesize': '10',
    'direction': 'up',
    'url': 'listActivityBaoming.action',
    'key': ''
  };
  $scope.listActivityBaoming = [];
  var isOver = false; //false:标志数据未加载完成
  $scope.errMsg = '';
  $scope.getMyActivities = function (params) {
    var defer = $q.defer();
    userService.postRequestWithPageNo(params).success(function (response) {
      var tempList = response.data;
      if (tempList.length == 0 && params.pageno == '1') {
        $scope.errMsg = '没有相关数据';
      } else {
        $scope.errMsg = '';
      }
      if (tempList.length < params.pagesize) {
        isOver = true;//true:标志数据加载完成
        defer.resolve(isOver);
      } else {
        isOver = false;
        defer.resolve(isOver);
      }
      if (params.direction == 'down') {
        $scope.listActivityBaoming = response.data;
      } else {
        $scope.listActivityBaoming = $scope.listActivityBaoming.concat(tempList);
      }
    });
    return defer.promise;
  };
  $scope.getMyActivities($scope.activityParams);

  /****************关键字搜索*****************************/
  $scope.searchMyActivties = function () {
    $scope.activityParams.key = $('.search-input').val();
    $scope.activityParams.pageno = 1;
    $scope.listActivityBaoming = [];
    $scope.getMyActivities($scope.activityParams);
  };
  //失去焦点，获取key的值
  $scope.myActivitiesBlur = function () {
    $scope.activityParams.key = $('.search-input').val();
  };

  //跳转到活动详情页
  //从某个页面跳转到活动详情
  //from = 0 活动召集页
  //from = 1 我报名的活动页
  $scope.goDetail = function (activityId) {
    $state.go('member-user-activitydetail', {
      'activityId': activityId,
      'from': '1'
    });
  };

}]);

