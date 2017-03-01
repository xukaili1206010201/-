'use strict';

var aboutModuleController = angular.module('aboutModuleController', []);

//联系我们
aboutModuleController.controller(
    'contactUsCtrl',
    function ($scope, $rootScope, $stateParams, guanjiaService, userService, $state, commonService, $timeout, $cookies) {

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

        userService.getProjectConfigInfo().success(function (resp) {
          switch (resp.code) {
            case '0':
              $scope.logoUrl = resp.data.logo;
              $scope.contactusAppname = resp.data.name;
              $scope.companyTel = resp.data.telphone;
              break;
          }
        });

        //获取用户的联系电话以及姓名
        var userName = ($rootScope.username == localStorage.mobile || $rootScope.username == undefined) ? "" : $rootScope.username;
        var mobile = localStorage.mobile;

        var userInfo = userName + " " + mobile;

        if (userInfo.trim() == 'undefined') {
          $scope.userInfo = '';
        }
        else {
          $scope.userInfo = userInfo;
        }

        //$scope.advice = "您的建议对我们很重要。";
        //意见反馈
        $scope.submitAdvice = function () {
          var params = {
            "mobile": $scope.userInfo,
            "content": $('.feedback-field').val(),
            "ticket": $cookies.get('tieckt')
          };

          if (params.content.trim() == '') {
            commonService.showWarnMessage("请输入您的建议或意见!");
            return;
          } else if (!params.mobile && params.mobile.trim() == '') {
            commonService.showWarnMessage("请留下您的联系方式!");
            return;
          } else if (params.mobile.length < 11) {
            commonService.showWarnMessage("请留下您完整的联系方式!");
            return;
          } else if (params.mobile.length >= 11) {
            //去除最后11位字符串
            var mobile = params.mobile.substring(params.mobile.length - 11);
            var regExp = /^[0-9]+$/i;
            if (regExp.test(mobile) == false) {
              commonService.showWarnMessage("请留下您正确的联系方式!");
            } else {
              var validateObject = userService.validateMobile(mobile);
              if (validateObject.validate == false) {
                commonService.showWarnMessage(validateObject.msg);
              } else {
                //获取客服电话
                userService.postRequestWithUrlAndParams("editFeedback.action", params).success(function (response) {
                  if (response.code == 0) {
                    commonService.showSuccessMessage("反馈成功!");
                    $timeout(function () {
                      $state.go('member-personal-usercenter');
                    }, 1000);
                  } else {
                    commonService.showSuccessMessage(response.data);
                  }

                }).error(function (data, status, header, config) {
                  alert('发送失败，请稍后尝试！');
                })
              }
            }

          }

        };

        //返回个人中心或未登录个人中心
        $scope.goToUserCenter = function () {
          if ($cookies.get('ticket') == null) {
            $state.go("member-personal-usercenterNo");
          } else {
            $state.go("member-personal-usercenter");
          }
        }

      });

    }
);


//关注我们
aboutModuleController.controller(
    'followUsCtrl',
    function ($scope, $stateParams, userService, $state, commonService, $cookies) {
      $scope.isShow = false;
      userService.postRequestWithUrlAndParams('interface/getProjectConfigInfo.action', null).success(function (response) {
        switch (response.code) {
          case '0':
            $scope.isShow = true;
            //设置微信服务号和订阅号
            $scope.wxfwh = response.data.wx_fu_account;
            $scope.wxdrh = response.data.wx_dy_account;

            //微信公众号二维码图片
            var divW = $('.wxcode-block').width();

            $("#wx-code").css({
              'width': divW + 'px',
              'height': divW + 'px'
            })

            $("#apple-code").css({
              'width': divW + 'px',
              'height': divW + 'px'
            })

            $("#android-code").css({
              'width': divW + 'px',
              'height': divW + 'px'
            })
            //设置二维码
            $scope.wxgzhCode = response.data.wx_fu_qrcode;
            $scope.wxdrhCode = response.data.wx_dy_qrcode
            $scope.appleCode = response.data.ios_qrcode;
            $scope.androidCode = response.data.android_qrcode;

            break;
        }

      }).error(function (data, status, header, config) {

      });

      $scope.shareToFriends = function () {
        //判断用户设备是否为微信
        var equipment = commonService.equipment();
        if (equipment == 'weixin') {
          commonService.showNoticeMessage("请点击右上角菜单键选择分享");
        }
      }


      //推荐给好友
      $scope.recommedToFriends = function () {
        var params = {"mobile": $scope.friendsMobile};
        if (!params.mobile) {
          commonService.showWarnMessage("请输入好友手机号");
          return;
        } else if (params.mobile.length != 11) {
          commonService.showWarnMessage("手机号有问题哟!");
          return;
        }
        userService.postRequestWithUrlAndParams("recommended.action", params).success(function (response) {
          switch (response.code) {
            case '0':
              commonService.showSuccessMessage("推荐成功");
              break;
          }

        }).error(function (data, status, header, config) {
          console.log("Error =======>>" + status);
        })

      };


      //前往appstore
      $scope.goToAppleAppStore = function () {
        top.location.href = 'http://www.baidu.com';
      }

      $scope.goToAndroidAppStore = function () {
        top.location.href = 'http://www.baidu.com';
      }


      //返回个人中心或未登录个人中心
      $scope.goToUserCenter = function () {
        if ($cookies.get('ticket') == null) {
          $state.go("member-personal-usercenterNo");
        } else {
          $state.go("member-personal-usercenter");
        }
      }

    }
);


//站点介绍
aboutModuleController.controller(
    'stationIntroCtrl',
    function ($scope, $rootScope, $stateParams, userService, $state, commonService, $cookies, guanjiaService, $timeout) {
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
        //站点数据
        $scope.param = {
          city_id: sessionStorage.gpscityId,
          key: '',
          fuwu_id: ''
        };
        $scope.errMsg = '';
        $scope.hadSorted = false;
        $scope.showStationLists = function (params) {
          userService.postRequestWithUrlAndParams('listServiceStation.action', params).success(function (response) {
            switch (response.code) {
              case '0':
                if (response.data.length == 0) {
                  $scope.errMsg = '没有相关数据';
                } else {
                  $scope.errMsg = '';
                  $scope.stationList = response.data;
                  var serviceStations = response.data;
                  var tmpArray = [];
                  for (var index = 0; index < serviceStations.length; index++) {
                    tmpArray.splice(0, 0, serviceStations[index]);
                  }
                  $scope.stationList = tmpArray;

                  if ($scope.showType) {
                    userService.showMap($scope.stationList);
                  } else {
                    //显示列表的时候就进行分组排序
                    $.getScript('scripts/common/selectcity/sort.js', function () {
                      startSorts(true);
                      $timeout(function () {
                        $scope.hadSorted = true;
                      }, 1000);
                      var lisArray = [];
                      var lis = $('.sort_letter');
                      $.each(lis, function (index, item) {
                        if ($.inArray($(item).text(), lisArray) == -1) {
                          lisArray.push($(item).text());
                        } else {
                          $(item).css('display', 'none');
                        }
                      })
                    });
                  }

                  //进入站点详情
                  $scope.jumpStationdetail = function (station_id, lat, lon) {
                    $state.go('member-about-stationdetail', {
                      station_id: station_id,
                      lat: lat,
                      lon: lon
                    });
                    sessionStorage.stationTab = 'list';
                  };
                }
                sessionStorage.removeItem('stationTab');//移除卡头
                break;
              case '-1':
                commonService.showWarnMessage("失败！");
                break;
            }

          });
        };
        //卡头样式
        //list 列表   map 地图
        if (sessionStorage.stationTab == 'list') {
          $('.stationintro-list').addClass('cartHead');
          $scope.showType = false;
          $scope.showStationLists($scope.param); //列表
        } else if (sessionStorage.stationTab == 'map' || sessionStorage.stationTab == null) {
          $('.stationintro-map').addClass('cartHead');
          if ($stateParams.fuwu_id != null) $scope.param.fuwu_id = $stateParams.fuwu_id;
          $scope.showType = true; //true:显示地图
          $scope.showStationLists($scope.param); //地图
        }

        $scope.showStationIntro = function (type) {
          $('.search-input').val('');
          $scope.param.key = '';
          if (type == '0') {
            $scope.hadSorted = false;
            $scope.showType = true;
          } else if (type == '1') {
            $scope.showType = false;
          }
          $scope.showStationLists($scope.param);
        };


        /******************关键字搜索***************/
        var val = '';
        $scope.searchStation = function () {
          $scope.stationList = [];
          val = $('.search-input').val();
          $scope.param.key = val;
          $scope.showStationLists($scope.param);
        };

        $scope.stationBlur = function () {
          $scope.param.key = $('.search-input').val();
        };

        //返回个人中心或未登录个人中心
        $scope.goToUserCenter = function () {
          val = $('.search-input').val();
          if (typeof val != 'undefined' && val != '') {
            $('.search-input').val('');
            $scope.searchStation();
            return;
          }
          var history = $cookies.get('from');
          if (history == '%tegong%') $state.go('guanjia-support');
          else if (history == '%jiating%') $state.go('guanjia-familyservice');
          else $state.go("member-personal-usercenter");
        }


        //拨打电话
        $scope.dailMobile = function (mobile) {
          event.stopPropagation();
          window.location.href = "tel:" + mobile;
        }

      })

    }
);

//站点详情
aboutModuleController.controller(
    'stationDetailCtrl',
    function ($scope, $rootScope, $stateParams, userService, commonService, $state, $cookies) {
      $scope.city_name = sessionStorage.gpscityName;

      $scope.station_id = $stateParams.station_id;
      userService.postRequestWithUrlAndParams('getServiceStation.action', {service_station_id: $scope.station_id}).success(function (response) {

        switch (response.code) {
          case '0':
            $scope.locationImg = response.data.location;
            $scope.stationDetailList = response.data;
            var serviceCommunity = response.data.service_community;
            var serviceFuwu = response.data.service_fuwu;
            var serviceCommunityStr = "覆盖小区：";
            if (serviceCommunity.length > 0) {
              for (var index = 0; index < serviceCommunity.length; index++) {
                var comDict = serviceCommunity[index];
                if (index == serviceCommunity.length - 1) {
                  serviceCommunityStr = serviceCommunityStr + comDict.name;
                } else {
                  serviceCommunityStr = serviceCommunityStr + comDict.name + '、';
                }

              }

            }

            $scope.effectedCommunity = serviceCommunityStr == '覆盖小区：' ? "" : serviceCommunityStr;

            $scope.address = response.data.community_address + response.data.address;

            // 百度地图API功能
            var map = new BMap.Map("detailMap");
            var point = new BMap.Point($stateParams.lon, $stateParams.lat);
            map.centerAndZoom(point, 15);
            map.enableScrollWheelZoom(true);
            var marker = new BMap.Marker(point);
            map.addOverlay(marker);

            map.addControl(new BMap.MapTypeControl());
            map.addControl(new BMap.ScaleControl());
            break;
          case '-1':
            console.log("参数为空！");
            break;
        }

      }).error(function (data, status, header, config) {

      })

    }
);

//关注我们服务号提示页
aboutModuleController.controller('serviceNoCtrl', function ($scope, $state, $cookies, $filter, $rootScope, userService) {
  $scope.isShow = false;
  var currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1);
  $cookies.put('lastdate_tag',currentDate,{'expires': expireDate});
  $scope.isShow = true;
  $scope.goNext = function (ckFollow) {
    if (ckFollow) {
      userService.editUserInfo({follow: 1}).success(function (resp) {
        console.log(resp.data);
      });
    }
    $state.go('guanjia-comservice');
  };

});