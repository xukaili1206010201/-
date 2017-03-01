'use strict';

var commonModuleController = angular.module('commonModuleController', []);

/**
 * 全局控制器，处理认证和权限等
 */
commonModuleController.controller(
    'applicationController',
    function ($scope, $filter, $rootScope, $state, AUTH_EVENTS, authService, $window, userService, commonService, $cookies) {
      $scope.credentials = {
        username: '',
        password: ''
      };

      $scope.setCurrentUser = function (user) {
        $scope.user = user;
      };

      //跟关注我们服务号提示页相关联
      userService.getUserInfo().success(function (resp) {
        if (resp.code == 0) {
          if (!resp.data.follow) {
            var lastDate_tag = $cookies.get('lastdate_tag');
            var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
            if (lastDate_tag == null || currentDate > lastDate_tag) {
              location.href = '/#/member/serviceno.htm';
            }
          } else {
            $cookies.remove('lastdate_tag');
          }
        }else{
          $cookies.remove('lastdate_tag');
        }
      });

      $scope.login = function (credentials) {

        authService.login(credentials)
            .then(function (user) {
              $scope.setCurrentUser(user);//最顶层的控制器中的变量
              $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

            }, function () {
              $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });

      };
      /************************ 定位 *************************/
      //报错
      //function showError(error) {
      //  switch (error.code) {
      //    case error.PERMISSION_DENIED:
      //      //alert("定位失败,用户拒绝请求地理定位");
      //      break;
      //    case error.POSITION_UNAVAILABLE:
      //      alert("定位失败,位置信息是不可用");
      //      break;
      //    case error.TIMEOUT:
      //      alert("定位失败,请求获取用户位置超时");
      //      break;
      //    case error.UNKNOWN_ERROR:
      //      alert("定位失败,定位系统失效");
      //      break;
      //  }
      //}
      //
      //function showPosition(position) {
      //  //经纬度
      //  $scope.lat = position.coords.latitude;
      //  $scope.lag = position.coords.longitude;
      //  $scope.latlon = $scope.lat + ',' + $scope.lag;
      //
      //  //baidu
      //  var url = "http://api.map.baidu.com/geocoder/v2/?ak=C93b5178d7a8ebdb830b9b557abce78b&callback=renderReverse&location=" + $scope.latlon + "&output=json&pois=0";
      //  $.ajax({
      //    type: "GET",
      //    dataType: "jsonp",
      //    url: url,
      //    beforeSend: function () {
      //      $("#position").html('正在定位...');
      //    },
      //    success: function (json) {
      //      if (json.status == 0) {
      //        $scope.cityResult = json.result.formatted_address;
      //        $("#position").html($scope.cityResult);
      //
      //      }
      //    },
      //    error: function (XMLHttpRequest, textStatus, errorThrown) {
      //      $("#position").html($scope.latlon + "地址位置获取失败");
      //    }
      //  })
      //}
      //
      //if (!sessionStorage.gpscityId) {
      //  if (navigator.geolocation) {
      //    navigator.geolocation.getCurrentPosition(showPosition, showError);
      //  } else {
      //    alert("浏览器不支持地理定位。");
      //  }
      //
      //  //请求定位接口
      //  guanjiaService.gpsCity({
      //    ticket: $cookies.get('ticket'),
      //    mobile: localStorage.mobile,
      //    address: $scope.cityResult,
      //    longitude: $scope.lag,
      //    latitude: $scope.lat
      //  }).success(function (data) {
      //
      //    $scope.result = data;
      //    $scope.city_name = $scope.result.data.name;
      //    $scope.city_id = $scope.result.data.city_id;
      //    switch ($scope.result.code) {
      //      case '0':
      //        //本地存储定位信息
      //        sessionStorage.setItem("gpscityName", $scope.city_name);
      //        sessionStorage.setItem("gpscityId", $scope.city_id);
      //
      //        break;
      //      case '-1':
      //        commonService.showWarnMessage("定位失败！");
      //        break;
      //    }
      //
      //  }).error(function (data, status, header, config) {
      //
      //  });
      //
      //}


      //设备宽高
      $rootScope.width = $(window).width();
      $rootScope.height = $(window).height();

      //返回
      $scope.$window = $window;
      $scope.back = function () {
        $window.history.back();
      };

      //底部定位
      $(window).resize(function () {
        var nowHeight = $(window).height();
        if (nowHeight < 400) {
          $('.KBheight').hide();
        } else {
          $('.KBheight').show();
        }
      });

      <!-- ************************************ 底部导航栏页面切换  ************************************-->
      //进入个人中心
      $scope.jumpUsercenter = function () {
        //判断是否有缓存
        if ($cookies.get('ticket') != null) {
          $state.go("member-personal-usercenter");
        } else {
          $state.go("member-personal-usercenterNo");
        }
      };

      //进入社区服务
      $scope.jumpComservice = function () {
        $state.go("guanjia-comservice");
      };

      //进入邻里社交
      $scope.jumpSociety = function () {
        $state.go('society-Neighborhood');
      };

      //进入商家福利
      $scope.jumpWelfare = function () {
        $state.go('welfare-seller');
        //if ($cookies.get('ticket') != null) {
        //  $state.go('welfare-seller');
        //} else {
        //  $state.go('member-personal-login',{from:'4'});
        //}

      };
      <!-- *******************************************************************************************-->


      //获取系统配置信息
      userService.getSystemConfigInfo(

      ).success(function (data) {
        $scope.result = data.data;

        switch (data.code) {
          case '0':
            //验证码有效秒数
            sessionStorage.codeTime = $scope.result.code;
            //密码最短位数
            sessionStorage.passwordNum = $scope.result.password;
            //订单尾号数
            $rootScope.orderNum = $scope.result.order;
            //轮播间隔秒数
            $rootScope.shuffling = $scope.result.shuffling;
            //跑马灯秒字
            $rootScope.slide = $scope.result.slide;
            //自动确认收货天数
            $rootScope.aout_order = $scope.result.aout_order;
            //优惠券开始提醒天数
            $rootScope.coupons_start_date = $scope.result.coupons_start_date;
            //优惠券终止提醒天数
            $rootScope.coupons_end_date = $scope.result.coupons_end_date;
            //收货可取消秒数
            $rootScope.cancel_order = $scope.result.cancel_order;
            //取消确认收货的时间
            $rootScope.cancel_confirm_order = $scope.result.cancel_confirm_order;
            break;
          case '-1':
            commonService.showWarnMessage("获取用户配置失败！");
            break;
        }
      }).error(function (data, status, header, config) {
      });

      //获取项目配置信息
      userService.getProjectConfigInfo(
          $scope.formData
      ).success(function (data) {
        switch (data.code) {
          case '0':
            $scope.ProjectConfigList = data.data;
            //项目徽记
            sessionStorage.logo = $scope.ProjectConfigList.logo;
            //项目名称
            sessionStorage.projectName = $scope.ProjectConfigList.name;
            //项目圈字图
            sessionStorage.font = $scope.ProjectConfigList.font;
            //项目介绍
            $rootScope.description = $scope.ProjectConfigList.description;
            //微信服务账号
            $rootScope.wx_account = $scope.ProjectConfigList.wx_fu_account;
            //微信服务账号二维码
            $rootScope.wx_qrcode = $scope.ProjectConfigList.wx_fu_qrcode;
            //苹果应用下载地址
            $rootScope.ios_url = $scope.ProjectConfigList.ios_url;
            //苹果应用二维码
            $rootScope.ios_qrcode = $scope.ProjectConfigList.ios_qrcode;
            //苹果应用下载地址
            $rootScope.android_url = $scope.ProjectConfigList.android_url;
            //苹果应用二维码
            $rootScope.android_qrcode = $scope.ProjectConfigList.android_qrcode;
            //客服电话
            $rootScope.companyTel = $scope.ProjectConfigList.telphone;
            sessionStorage.showCompanyTel = $rootScope.companyTel;
            //$scope.showCompanyTel = "1-376-4906801";
            var reg = new RegExp("-", "g")
            sessionStorage.companyTel = sessionStorage.showCompanyTel.replace(reg, "");

            break;
          case '-1':
            commonService.showWarnMessage("系统出错，请稍后重试！");
            break;
        }
      }).error(function (data, status, header, config) {

      });

      //正则判断
      $rootScope.regxMobile = /1[34578]\d{9}/;
      $rootScope.regxPassword = /^[0-9a-zA-Z]*$/;//字母或数字
      $rootScope.regxCode = /^\d{6}$/;
      $rootScope.regxIdnumber = /^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/;
      $rootScope.regxEmail = /(^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$)|(^$)/;
    }
);

/**
 * 缺省控制器
 */
commonModuleController.controller(
    'notFoundCtrl',
    function ($scope) {
      $scope.errorImg = 'images/weihu.png';
    }
);

/**
 * 普通信息弹出框页面控制器
 */
commonModuleController.controller(
    'modalInfoInstanceCtrl',
    function ($scope, $uibModalInstance, type, message) {

      $scope.type = type;
      $scope.message = message;

      $scope.ok = function () {
        $uibModalInstance.close($scope.selected);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    }
);

/**
 * 操作类信息弹出框控制器
 */
commonModuleController.controller(
    'modalOperateInfoInstanceCtrl',
    function ($scope, $uibModalInstance, operate, message, params) {

      $scope.operate = operate;
      $scope.message = message;

      if (Boolean(params.type)) {
        $scope.operator = '-';
      } else {
        $scope.operator = '+';
      }

      $scope.ok = function () {
        $uibModalInstance.close($scope.selected);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

    }
);

