/**
 * Created by crazybear on 16/4/21.
 */
'use strict';

var guanjiaModuleController = angular.module('guanjiaModuleController', []);

//社区服务
guanjiaModuleController.controller(
    'comServiceCtrl',
    function ($scope, $rootScope, guanjiaService, userService, $state, $location, commonService, $sce, $http, $cookies, $q) {

      $scope.fontLogo = sessionStorage.font;
      $scope.imgShow = true; //标志轮播图数据还未加载
      //清除历史纪录
      $cookies.remove('businessId');
      $cookies.remove('from');
      $cookies.remove('city_fuwu_id');
      $cookies.remove('tab');
      // localStorage.removeItem('skip');
      localStorage.removeItem('showType');
      localStorage.removeItem('statusElem');
      localStorage.removeItem('goBack');
      localStorage.removeItem('payInfo');
      localStorage.removeItem('goodsDetailFrom');
      localStorage.removeItem('goodsId');
      localStorage.removeItem('target');
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

        //热门服务
        guanjiaService.listCityService({
          city_id: sessionStorage.gpscityId,
          //city_id: '8a28d7d855773dee015577423fa00002',
          hot: '0'
        }).success(function (response) {
          switch (response.code) {
            case '0':
              $scope.hotType = response.data.type;
              $scope.hotData = response.data;
              $scope.Hotjump = function (hotType, fuwu_id) {
                $rootScope.hotFuwu_id = fuwu_id;
                switch (hotType) {
                  case '特供服务':
                    $state.go('guanjia-support', {from: '1'});
                    $cookies.put('from', '%tegong%');
                    break;
                  case '家庭服务':
                    $state.go('guanjia-familyservice', {from: '1'});
                    $cookies.put('from', '%jiating%');
                    break;
                  case '家庭金融':
                    $state.go('guanjia-familyaccount');
                    localStorage.jinrongFrom = "%comservice%";
                    break;
                }
              };
          }

        }).error(function () {
        });

        //*************广告轮播图**************
        var params = {
          "type": "system,city",
          "city_id": sessionStorage.gpscityId,
          "label": '社区服务'
        };
        userService.postRequestWithUrlAndParams("listAd.action", params).success(function (response) {
          switch (response.code) {
            case '0':
              if (response.data) {
                $scope.myInterval = parseInt($rootScope.shuffling) * 1000;
                $scope.slides = response.data;

                if ($scope.slides.length > 0) {
                  setTimeout(function () {
                    $scope.imgShow = false;//true:标志轮播图数据加载完成
                  }, 1000);
                }
              }

              break;
            case '-1':
              console.log("社区服务轮播图参数为空");
              break;
          }
        }).error(function (data, status, header, config) {

        });

      });

      guanjiaService.getNotice({type: 'system', label: '社区服务'}).then(function (data) {
        if (data != null && data.length > 0) {
          var marqueeContent = '';
          for (var i = 0; i < data.length; i++) {
            marqueeContent += '<li>' + data[i].content + '<li>';
          }
          marqueeContent = "<marquee behavior='scroll'  scrollAmount='" + $scope.slide + "'>" +
              "<ul class='list-inline' style='white-space: nowrap'>" + marqueeContent + "</ul></marquee>";
          $('.marquee-broadcast').html(marqueeContent);
          $('.marquee-broadcast').css('display', 'block');
        } else {
          $('.marquee-broadcast').css('display', 'none');
        }
      }, function (err) {
        commonService.showErrorMessage("请求错误！");
      });

      //统计未读数量
      $scope.getunReadCount = function () {
        var defer = $q.defer();
        if ($cookies.get('ticket')) {
          guanjiaService.count({
            ticket: $cookies.get('ticket')
          }).success(function (response) {
            if (response.code == '0') {
              $scope.isShow = true;
              //订单
              $scope.order_size = response.data.order_size;
              $scope.appointment_size = response.data.appointment_size;
              $scope.order = $scope.order_size + $scope.appointment_size;
              //购物车
              $scope.order_cart_size = response.data.order_cart_size;
              $scope.appointment_cart_size = response.data.appointment_cart_size;
              $scope.cart = $scope.order_cart_size + $scope.appointment_cart_size;

              $scope.message = response.data.message;//消息
              $scope.coupons = response.data.coupons;//优惠券
              defer.resolve(response.data);
            } else {
              $scope.isShow = false;
            }
          });
        }
        return defer.promise;
      };
      $scope.countPromise = $scope.getunReadCount();


      //*************end**************

      //进入我的消息
      $scope.jumpUsermessage = function () {
        if ($cookies.get('ticket') == null) {
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          localStorage.skip = 'comservice';
          localStorage.goBack = 'comservice';
          $state.go('member-user-message', {from: '0'});
        }
      };
      //进入我的优惠券
      $scope.jumpMycoupons = function () {
        if ($cookies.get('ticket') == null) {
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          localStorage.skip = 'comservice';
          $state.go('member-user-mycoupons');
        }
      };
      //进入我的购物车
      $scope.jumpCart = function () {
        if ($cookies.get('ticket') == null) {
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          if ($scope.order_cart_size != 0 || ($scope.order_cart_size == 0 && $scope.appointment_cart_size == 0)) {
            localStorage.skip = '购买';
          } else {
            localStorage.skip = '预约';
          }
          $state.go('member-user-cart', {from: 0});
        }
      };
      //进入我的订单
      $scope.jumpMyorder = function () {
        if ($cookies.get('ticket') == null) {
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          if ($scope.order_size != 0 || ($scope.order_size == 0 && $scope.appointment_size == 0)) {
            localStorage.skip = 'comservice';
            $state.go('member-user-myorder', {"from": 0});
          } else {
            $state.go('member-user-reserve');
          }
          localStorage.goBack = 'comservice';
        }
      };

      //进入公共服务
      $scope.jumpPublicservice = function () {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('from', '%comservice%', {'expires': expireDate.toUTCString()});
        $state.go('guanjia-publicservice');
      };
      //进入特供服务
      $scope.jumpSupport = function () {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('from', '%tegong%', {'expires': expireDate.toUTCString()});
        localStorage.tegongFrom = '%tegong%';
        $state.go('guanjia-support', {from: '0'});
      };

      //进入在线超市
      $scope.jumpShopping = function () {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('from', '%comservice%', {'expires': expireDate.toUTCString()});
        $state.go('guanjia-shoppingonline');
      };

      //进入家庭服务
      $scope.jumpFamilyservice = function () {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('from', '%jiating%', {'expires': expireDate.toUTCString()});
        $state.go('guanjia-familyservice', {from: '0'});
      };

      //进入家庭金融
      $scope.jumpFamilyaccount = function () {
        localStorage.jinrongFrom = "%comservice%";
        $state.go('guanjia-familyaccount');
      };

      //进入活动召集
      $scope.jumpActivity = function () {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.put('from', '%comservice%', {'expires': expireDate.toUTCString()});
        $state.go('member-user-callactivity');
      };


      //点击广告前往广告详情
      $scope.adToDetail = function (index) {
        var adObject = $scope.slides[index];
        userService.adLinkTo("guanjia-comservice", adObject);
        //添加广告日志
        localStorage.target = "ad";
        if (adObject.category == '动态') commonService.addAdLog(adObject);
      }

    }
);


//特供服务
guanjiaModuleController.controller(
    'supportCtrl',
    function ($scope, $rootScope, guanjiaService, userService, $state, commonService, $q, $cookies, $stateParams) {
      if ($stateParams.target != null) localStorage.target = $stateParams.target;
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
        /************************************ 初始化  ****************************************/
        $scope.formData = {};
        $scope.myInterval = parseInt($rootScope.shuffling) * 1000; //轮播图播放间隔时间
        if ($cookies.get('from') == '%guanggao%') {
          $scope.from = $cookies.get('from');
        } else if ($cookies.get('from') == 'toBack') { //广告跳转后再返回到本页
          $scope.from = localStorage.prevFrom;
          localStorage.removeItem('prevFrom');
          $cookies.put('from', '%tegong%');
        } else {
          $scope.from = $stateParams.from; //from  0:特供服务  1:顺手早餐
          if (typeof $stateParams.label != 'undefined') {
            $scope.label = $stateParams.label;
            $cookies.put('from', '%tegong%');
          }
        }
        if ($stateParams.target != null) localStorage.target = $stateParams.target;

        $scope.tabIndex = $rootScope.supportTabIndex == undefined ? 0 : $rootScope.supportTabIndex;
        /**
         *   获取特供服务的城市服务卡头和对应服务的商家
         */
        $scope.specialService = getSpeciaService();
        $scope.supportContent = null;
        function getSpeciaService() {
          var defer = $q.defer();
          guanjiaService.listCityService({
            city_id: sessionStorage.gpscityId,
            type: '特供服务'
          }).success(function (data) {

            if (data.data.length > 0) {
              $scope.supportContent = '';//有城市服务数据
              $scope.fuwu_id = data.data;
              defer.resolve($scope.fuwu_id);
              //获取服务id和index分别存入数组$scope.fuwu和fuwu_count
              $scope.fuwu = [];
              $scope.fuwu_count = [];
              $.each($scope.fuwu_id, function (index, info) {
                $scope.fuwu_count.push(index);
                $scope.fuwu.push(info.city_fuwu_id);
              });

              //初次进入特供服务的商家列表
              if ($scope.from != '1') {
                var intiInde = null;
                if ($scope.from == '%guanggao%') {
                  var tabItem = $cookies.get('name');
                  $.each($scope.fuwu_id, function (index, info) {
                    if (info.name == tabItem) {
                      intiInde = index;
                      $scope.tabIndex = index;
                      return false;
                    }
                  });
                  if (intiInde == undefined) {
                    commonService.showWarnMessage('特供服务的' + tabItem + '选项卡不存在！');
                    $state.go(localStorage.adRoute);
                    $cookies.put('from', 'toBack');
                    return;
                  }
                } else {
                  if (typeof $scope.label != 'undefined') {
                    $.each($scope.fuwu_id, function (index, info) {
                      if (info.label == $scope.label) {
                        $scope.tabIndex = intiInde = index;
                        return false;
                      }
                    });
                  }

                  intiInde = null == intiInde ? $scope.tabIndex : intiInde;
                }
                $scope.params.city_fuwu_id = $scope.fuwu_id[intiInde].city_fuwu_id;
                //根据不同服务赋值给label，在跑马灯指令里,和公告里都已使用。
                // 这是初次进入，后面的修改在卡头更换事件里
                $scope.label = $scope.fuwu_id[intiInde].label;
                getAdverts(); //获得对应的轮播图
                getNotice();//获得对应的跑马灯数据
                if (!$scope.fuwu_id[intiInde].config) {   //后台要求等于0就显示城市提示信息
                  $scope.isShowPrompt = true;
                  getPrompt($scope.fuwu_id[intiInde].city_fuwu_id);//获得城市对应的提示
                } else {
                  $scope.isShowPrompt = false;
                }
              }
              //从顺手早餐进入的
              else if ($scope.from == '1') {
                $scope.breakfastFuwu_id = $rootScope.hotFuwu_id;
                $scope.params.city_fuwu_id = $scope.breakfastFuwu_id;
                // 早餐所对应的index
                $.each($scope.fuwu, function (i, value) {
                  if (value == $scope.breakfastFuwu_id) {
                    $scope.drycleanIndex = i;
                  }
                });
                $scope.label = $scope.fuwu_id[$scope.drycleanIndex].label;

                getAdverts(); //获得对应的轮播图
                getNotice();//获得对应的跑马灯数据
                if ($scope.fuwu_id[$scope.drycleanIndex].config == 0) {   //后台要求等于0就显示城市提示信息
                  $scope.isShowPrompt = true;
                  getPrompt($scope.breakfastFuwu_id);
                } else {
                  $scope.isShowPrompt = false;
                }

              }

            } else {
              $scope.supportContent = '没有相关数据';//无城市服务数据
              //commonService.showErrorMessage("该城市暂无相关服务！");
            }
            $scope.businessFun($scope.params);
          });
          return defer.promise;
        }

        /**end*/


        /**
         * 广告轮播图
         */
        $scope.imgShow = true;//标志着广告数据还未加载
        function getAdverts() {
          var promise = guanjiaService.getAdverts($scope.label);
          promise.then(function (data) {
            if (data.length > 0) {
              $scope.slides = data;
              //轮播图请求到数据1秒后显示
              setTimeout(function () {
                $scope.imgShow = false;
              }, 1000);
            }

          });
        }


        /**
         *  获取公告数据
         */
        function getNotice() {
          var noticeParams = {
            type: 'system,city',
            city_id: sessionStorage.gpscityId,
            label: $scope.label
          };
          guanjiaService.getNotice(noticeParams).then(function (data) {
            if (data != null && data.length > 0) {
              var marqueeContent = '';
              for (var i = 0; i < data.length; i++) {
                marqueeContent += '<li>' + data[i].content + '<li>';
              }
              marqueeContent = "<marquee behavior='scroll'  scrollAmount='" + $scope.slide + "'>" +
                  "<ul class='list-inline' style='white-space: nowrap'>" + marqueeContent + "</ul></marquee>";
              $('.marquee-broadcast').html(marqueeContent);
              $('.marquee-broadcast').css('display', 'block');
            } else {
              $('.marquee-broadcast').css('display', 'none');
            }
          }, function (err) {
            commonService.showErrorMessage("请求错误！");
          });
        }

        /**
         * 获取城市服务提示数据
         */
        function getPrompt(fuwu_id) {
          var params = {
            fuwu_id: fuwu_id
          };
          guanjiaService.getCityServicePrompt(params).then(function (reponse) {
            if (reponse.data != null) {
              switch (reponse.data.code) {
                case '0':
                  $scope.promptData = reponse.data.data;
                  break;
                case '1':
                  console.log('ca');
                  break;
                case '2':
                  $state.go('guanjia-comservice');
                  break;
              }
            }
          }, function (error) {
            commonService.showErrorMessage("请求错误,请稍后再试~")
          });
        }

        //特供服务和早餐请求参数
        if ($scope.from != '1') {
          $scope.params = {
            city_id: sessionStorage.gpscityId,
            city_fuwu_id: '',
            pageno: '1', //页码
            pagesize: '10', //页数
            url: 'listBusiness.action',
            direction: 'up',
            fuwuType: '0', //判断是否首次加载，0：默认为初次加载页面，1：不是初次加载页面
            key: ''
          };
        } else {
          $scope.params = {
            city_id: sessionStorage.gpscityId,
            city_fuwu_id: '',
            pageno: '1', //页码
            pagesize: '10', //页数
            url: 'listBusiness.action',
            direction: 'up',
            fuwuType: '1',
            key: ''
          }
        }

        $scope.business = [];
        var isOver = false; //false:标志数据未加载完成
        $scope.errMsg = '';
        $scope.businessFun = function (params) {
          var defer = $q.defer();
          userService.postRequestWithPageNo(params).success(function (response) {
            var tempList = response.data.list;
            $scope.allBusiness = response.data;
            if (tempList.length == 0 && params.pageno == '1') {
              $scope.errMsg = '没有相关数据';//商家列表无数据
            } else {
              $scope.errMsg = '';//商家列表有数据
            }
            if (tempList.length < params.pagesize) {
              isOver = true;//true:标志数据加载完成
              defer.resolve(isOver);
            } else {
              isOver = false;
              defer.resolve(isOver);
            }
            if (params.direction == 'down') {
              $scope.business = response.data.list;
            } else {
              $scope.business = $scope.business.concat(tempList);
            }

          });
          return defer.promise;
        };

        /************************************** end ******************************************/

        /*********************************** 页面事件监听 *************************************/
        /**************关键字搜索*******************/
        var val = '';
        $scope.searchBusiness = function () {
          $scope.isSearch = false;
          $scope.busList = [];
          val = $('.search-input').val();
          $scope.business = [];
          $scope.params.pageno = '1';
          $scope.params.key = val;
          $scope.businessFun($scope.params);
        };
        //失去焦点，获取key的值
        $scope.supportBlur = function () {
          $scope.params.key = $('.search-input').val();
        };

        //点击按钮卡头更改服务id
        $scope.changeServiceTab = function (fuwu) {
          $scope.supportContent = null;
          $('.search-input').val('');
          $('.errMsg').css('display', 'none');
          $scope.params.key = '';
          $scope.slides = "";
          $scope.params.direction = 'down';
          $scope.params.fuwuType = '2';
          $scope.params.pageno = '1';
          $scope.params.city_fuwu_id = fuwu.city_fuwu_id;
          $scope.business = [];
          $scope.label = fuwu.label;   //卡头的label
          $scope.isShowPrompt = false;//提示信息默认不显示
          $scope.businessFun($scope.params);
          getAdverts(); //获得对应的轮播图
          getNotice(); //获得对应的跑马灯数据

          if (!fuwu.config) {
            $scope.isShowPrompt = true;
            getPrompt(fuwu.city_fuwu_id);//获得对应的城市服务提示
          } else {
            $scope.isShowPrompt = false;
          }
        };

        /**
         * 点击城市服务的提示，进入站点介绍
         */

        $scope.goStationIntro = function () {
          $state.go('member-about-stationintro', {fuwu_id: $scope.params.city_fuwu_id});
          // window.location.href = 'http://www.lesnho.com/wx/service-map';
        };

        //返回上一页
        $scope.backtocomservice = function () {
          val = $('.search-input').val();
          if (val != '') {
            $('.search-input').val('');
            $scope.searchBusiness();
          }
          else if ($cookies.get('from') == '%guanggao%') {
            $state.go(localStorage.adRoute);
            //返回时，将$cookies.get('from')修改为toBack
            $cookies.put('from', 'toBack');
          } else {
            $rootScope.supportTabIndex = null; //设置卡头所以为初始化
            $state.go('guanjia-comservice')
          }

          //localStorage.removeItem('tegongFrom');
        };

        //点击商家，跳转到商品列表
        $scope.jumpgoodslist = function (businessId) {
          localStorage.removeItem('skip');
          //默认加载全部数据
          localStorage.showType = '0';
          if (localStorage.tegongFrom == '%guanggao%') {
            $cookies.put('from', '%tegong%');
          }
          $state.go('guanjia-goodslist');
          var expireDate = new Date();
          expireDate.setDate(expireDate.getDate() + 30);
          var fuwu = $cookies.get('city_fuwu_id');
          if (null == businessId) {   //如果商家存在，说明不是从所有商家进去的，就清除city_fuwu—id
            $cookies.put('city_fuwu_id', $scope.params.city_fuwu_id, {'expires': expireDate.toUTCString()}); //存入当前城市的服务id
          } else {
            $cookies.remove('city_fuwu_id');
          }
          $cookies.put('businessId', businessId, {'expires': expireDate.toUTCString()});
        };


        //点击广告前往广告详情
        $scope.adToDetail = function (index) {
          var adObject = $scope.slides[index];
          if ($stateParams.from == '0' || $stateParams.from == '1') {
            //记住跳转前的$scope.from的值
            localStorage.prevFrom = $stateParams.from;
          }
          localStorage.target = "ad";
          userService.adLinkTo("guanjia-support", adObject);

          //添加广告日志
          if (adObject.category == '动态') commonService.addAdLog(adObject);

        };
        /************************************** end ******************************************/


      })
    }
);

//商家详情
guanjiaModuleController.controller(
    'sellerdetailCtrl',
    function ($scope, $stateParams, $rootScope, guanjiaService) {
      $scope.businessId = $stateParams.businessId;
      guanjiaService.businessDetail({business_id: $scope.businessId}).success(function (response) {
        if (response.code == '0') {
          $scope.business = response.data;
          $scope.isShowOne = $scope.business.license.length > 0 || $scope.business.goods.length > 0 ||
              $scope.business.location.length > 0 || $scope.business.work.length > 0;
        } else {
          console.log('请求商家详情接口有误！ ' + response.data);
        }
      });

    }
);

//商品列表
guanjiaModuleController.controller(
    'goodslistCtrl',
    function ($scope, $stateParams, $rootScope, guanjiaService, userService, $state, $q, $cookies, commonService, $timeout) {

      //from 判断从哪个页面跳转到此页
      // %fuli% 商家福利  %tegong%  特供服务 %couponsSeller% ：优惠券商家页
      $scope.from = $cookies.get('from');
      if (null != $stateParams.business_id) $cookies.put('businessId', $stateParams.business_id);
      $scope.businessId = $cookies.get('businessId');
      $scope.city_fuwu_id = $cookies.get("city_fuwu_id");
      $scope.goodIds = $cookies.get('goodIds');

      if ($stateParams.target != null) localStorage.target = $stateParams.target;

      if ($scope.from == '%couponsSeller%') {
        $scope.busType = Boolean($cookies.get('busType'));
      }

      //返回到商家列表
      $scope.backtosupport = function () {
        val = $('.search-group .search-input').val();
        if (val != '') {
          $('.search-group .search-input').val('');
          $scope.searchGoods();
        }
        else if ($scope.from == '%fuli%') {
          $state.go('welfare-seller');
        } else if ($scope.from == '%tegong%') {
          $state.go('guanjia-support');
        } else if ($scope.from == '%couponsSeller%') { //返回到优惠券商家页
          $state.go('member-user-mycoupons');
          localStorage.skip = 'couponsSeller';
          localStorage.showType = '1';
          $cookies.remove('goodIds');
          $cookies.remove('businessId');
          $cookies.remove('from');
          $cookies.remove('busType');
        } else if ($scope.from == '%guanggao%') {
          $state.go(localStorage.adRoute);
          $cookies.put('from', 'toBack');
        } else {    //如果参数被修改
          $state.go('guanjia-support');
        }
      };

      //获取公告数据
      function getNotice() {
        var defer = $q.defer();
        guanjiaService.listNotice({
          type: $scope.businessId ? 'business' : 'city',
          city_id: sessionStorage.gpscityId,
          business_id: $scope.businessId
        }).success(function (data) {
          defer.resolve(data.data);
          if (data.code == 0) {
            $scope.marqueeContent = data.data;
          } else {
            $scope.marqueeContent = '';
          }
          $.getScript('scripts/common/plugins/marquee.js', function () {
            createMarquee();
          });
        });
        return defer.promise;
      }

      $scope.noticePromise = getNotice();
      /*
       * 从优惠券商家页跳转到商品列表页时，选项卡数据使用listGood.action
       * 中的category数据，
       * 从其他页面跳转到商品列表页时，调用listCategory()来获取
       * 选项卡的数据
       * */
      //调用分类接口
      $scope.category = [];
      function listCategory() {
        var defer = $q.defer();
        var cateParams = {
          business_id: $scope.businessId,
          city_fuwu_id: $scope.city_fuwu_id
        };
        guanjiaService.listCategory(cateParams).success(function (response) {
          if (response.code == '0') {
            defer.resolve(response.data);
          }
        });
        return defer.promise;
      }

      $scope.getCate = function (cate) {
        var defer = $q.defer();
        $scope.category = cate;
        //如果商家商品无分类
        if ($scope.category.length == 0) {
          $('.goods-segment-control').css('display', 'none');
          localStorage.showType = '0';
        }
        $scope.category.unshift({category_id: '1', name: '全部'});
        defer.resolve($scope.category);
        //广告跳转过来
        if ($scope.from == '%guanggao%') {
          var tabItem = $cookies.get('name');
          if (tabItem == '全部') {
            localStorage.cateId = '';
          } else {
            var tabIndex;
            $.each($scope.category, function (index, info) {
              if (info.name == tabItem) {
                localStorage.cateId = info.category_id;
                localStorage.showType = index;
                tabIndex = index;
                return false;
              }
            });
            if (tabIndex == undefined) {
              commonService.showWarnMessage('商品列表页的' + tabItem + '选项卡不存在！');
              $state.go(localStorage.adRoute);
              $cookies.put('from', 'toBack');
            }

          }
        }

        //获取分类的index，保存在数组$scope.category_count中
        $scope.category_count = [];
        $.each($scope.category, function (index, info) {
          $scope.category_count.push(index);
        });
        //默认加载全部的数据
        $scope.index = localStorage.showType;
        if ($scope.index != '0') {
          $scope.params.category_id = localStorage.cateId;
        }

        if ($scope.from != '%couponsSeller%') {
          $scope.goodslist = [];
          $scope.goodsListFun($scope.params);
        }
        return defer.promise;
      };
      //不是从优惠券商家页过来的，要调用分类接口
      if ($scope.from != '%couponsSeller%') {
        listCategory().then(function (data) {
          $scope.goodlistPromise = $scope.getCate(data);
        });
      }

      $scope.direction = 'down';
      //获取商品数据
      $scope.params = {
        business_id: $scope.businessId,
        city_fuwu_id: $scope.city_fuwu_id,
        pageno: '1', //页码
        pagesize: '15', //页数
        direction: $scope.direction,
        url: 'listGoods.action',
        category_id: null,
        sort: 'week_count',
        key: ''
      };

      $scope.goodslist = [];
      var isOver = false;//false:标志数据未加载完成
      $scope.errMsg = '';
      var isFirst = true; //(从优惠券商家页跳转过来)判断是否是第一次调用$scope.goodsListFun 方法
      $scope.goodsListFun = function (params) {
        var defer = $q.defer();
        userService.postRequestWithPageNo(params).success(function (response) {
          /********从优惠券商家页跳转过来，选项卡分类保存在data.category中**************/
          //只执行一次，来获取分类信息
          if (($scope.from == '%couponsSeller%') && isFirst) {
            $scope.category = response.data.category;
          }

          /********获取存储在data.goods中的商品数据*******************************/
          var tempList = response.data.goods;
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
          $scope.peisongInfo = {};
          if (params.direction == 'down') {
            if (response.data.peisongRange != '') {
              $scope.peisongInfo.peisongRange = response.data.peisongRange;
              $scope.peisongInfo.peisong = response.data.peisong;
              $scope.peisongInfo.manjian = response.data.manjian;
            }
            $scope.goodslist = response.data.goods;
          } else {
            $scope.goodslist = $scope.goodslist.concat(tempList);
          }

          ////判断是否为新品
          //$scope.isnew = function (value) {
          //  if (value == 'Y')
          //    return true;
          //  else
          //    return false;
          //};
          ////判断是否为爆品
          //$scope.ishot = function (value) {
          //  if (value == 'Y')
          //    return true;
          //  else
          //    return false;
          //};
        });
        return defer.promise;
      };

      //如果是从优惠券商家页跳转过来
      if ($scope.from == '%couponsSeller%') {
        //console.log('----优惠券商家页--进入-------------');
        $scope.category = [];
        $scope.params.business_id = '';
        $scope.params.goodsIds = $scope.goodIds;
        $scope.goodsListFun($scope.params).then(function (data) {
          isFirst = false;//第一次调用后，将isFirst置为false
          $scope.goodlistPromise = $scope.getCate($scope.category);
        });
      }


      //排序
      $scope.changeSelected = function () {
        $scope.params.sort = $('.filter-block .dropdown').val();
        $scope.params.direction = 'down';
        $scope.goodsListFun($scope.params);
      };


      /***********************关键字搜索******************************************/
      var val = '';
      $scope.searchGoods = function () {
        val = $('.search-group .search-input').val();
        $scope.params.pageno = '1';
        $scope.goodslist = [];
        $scope.params.key = val;
        $scope.goodsListFun($scope.params);
      };
      //失去焦点，获取key的值
      $scope.goodsBlur = function () {
        $scope.params.key = $('.search-group .search-input').val();
      };

      //分类按钮的点击效果
      $scope.changecate = function (id, index) {
        $('.search-group .search-input').val('');
        if (id == '1') {
          //$scope.index = $scope.category_count.length - 1;
          $scope.params.category_id = null;
        } else {
          $scope.params.category_id = id;
          localStorage.cateId = id;
        }
        $scope.index = index;
        localStorage.showType = index;
        $scope.goodslist = [];
        $scope.params.pageno = '1';
        $scope.goodsListFun($scope.params);
      };
      //商家详情
      guanjiaService.businessDetail({business_id: $scope.businessId}).success(function (data) {

        $scope.business = data.data;
      });
      //跳转到卖家详情
      $scope.jumpSellerdetail = function () {
        if (null != $scope.businessId) {
          $state.go('guanjia-sellerdetail', {businessId: $scope.businessId});
        }
      };
      //跳转到购买页面
      $scope.jumppurchase = function (id, index) {
        localStorage.showType = index;
        localStorage.removeItem('skip');

        localStorage.goodsId = id;
        sessionStorage.station_id = "";
        sessionStorage.removeItem('isSelectedMyCommunity');//是否选择我的小区标识符
        $state.go('service-purchase', {
          operate: 112,
          obj: {}
        });
        $cookies.put('tab', '?list%');
      };
      //跳转到商品详情
      $scope.jumpgoodsDetail = function (id, index, type) {
        localStorage.showType = index;
        localStorage.removeItem('skip');
        //localStorage.goodsDetailFrom = "%goodsList%";
        if ($scope.from == '%couponsSeller%') { //优惠券商家页中点击全部商家跳转到商品列表页
          localStorage.goodsDetailFrom = "%couponsSeller%";
          if (type == '特供服务') {
            localStorage.goodsId = id;
            $state.go('service-goodsDetail', {goods_id: localStorage.goodsId});
          } else if (type == '家庭服务') {
            $state.go('guanjia-familyservicedetail', {
              'goodsId': id
            });
          }
        } else {
          //localStorage.showType = index;
          //localStorage.removeItem('skip');
          localStorage.goodsId = id;
          localStorage.goodsDetailFrom = "%goodsList%";
          $state.go('service-goodsDetail', {goods_id: localStorage.goodsId});
        }

      }
    }
);

guanjiaModuleController.controller(
    'payCtrl',
    function ($scope, $stateParams, guanjiaService, userService, $state, $location, commonService, $timeout, $cookies, payCacheService, $filter) {

      $scope.orderSumPay = 0;
      $scope.needsPay = 0;
      /*
       *@params:from 判断页面从哪儿跳转来
       * from = 1; 从购物车下单成功后跳转
       * from = 2; 从我的订单-未支付订单选择支付跳转
       * from = 3; 从我的购买页直接支付跳转
       * from = 4; 从订单详情页选择支付跳转
       * from = 5; 购物车
       * from = 6; 我的预约单
       * from = 7; 我的预约单详情
       *
       * from = 10 ;从第三方支付平台点击程序内部的返回按钮返回
       */
      var from = $stateParams.from;
      var orderIds;
      // //从购物车来支付
      // if (from == 1 || sessionStorage.isFrom == 1) {
      //   orderIds = payCacheService.getProperty("orderId");
      // }
      // //我的订单来支付
      // if (from == 2 || sessionStorage.isFrom == 2) {
      //   orderIds = payCacheService.getProperty('orderId');
      // }
      // //从购买页来支付
      // if (from == 3 || sessionStorage.isFrom == 3) {
      //   orderIds = payCacheService.getProperty("orderId");
      //
      // }
      // //我的预约单来支付
      // if (from == 6 || sessionStorage.isFrom == 6) {
      //   orderIds = payCacheService.getProperty('orderId');
      // }
      // //订单详情
      // if (from == 4 || sessionStorage.isFrom == 4) {
      //   orderIds = payCacheService.getProperty('orderId');
      // }

      //在第三方支付平台点击程序内部的返回按钮
      if (from == 10) {
        orderIds = payCacheService.getProperty("orderId");
      } else {
        orderIds = payCacheService.getProperty('orderId');
        payCacheService.removeAllItem();
        payCacheService.setProperty('orderId', orderIds);
      }

      //toFixed 方法有bug，不同的浏览器对它的解析不一样。比如，0.009.toFixed(2)在firefox下 为0.01 而在IE7下为
      //0.00
      Number.prototype.toFixed = function (exponent) {
        return parseInt(this * Math.pow(10, exponent) + 0.5) / Math.pow(10, exponent);
      };

      var params = {json: JSON.stringify(orderIds)};
      //请求用户订单
      userService.postRequestWithUrlAndParams("getOrderByPay.action", params).success(function (response) {
        if (response.code == 0) {
          //订单列表
          $scope.orderList = response.data.order;
          var sunTmp = 0.00;
          for (var index = 0; index < $scope.orderList.length; index++) {
            var orderObject = $scope.orderList[index];
            var orderPrice = parseFloat(orderObject.sum);
            sunTmp += orderPrice;
          }
          $scope.orderSumPay = sunTmp;

          var balance = response.data.balance;

          $scope.peisongTotal = response.data.peisongTotal;

          //用户的账户余额
          $scope.userBanlance = parseFloat(balance);

          //用户账户余额输入框中的数字
          var banlancePaid = $scope.orderSumPay < $scope.userBanlance ? $scope.orderSumPay : $scope.userBanlance;

          $scope.banlancePaid = banlancePaid.toFixed(2);

          //需付金额
          $scope.needsPay = $scope.orderSumPay - $scope.banlancePaid;

          //支付方式列表,默认选中第一个
          $scope.paymentTypeList = response.data.payment;
          if (commonService.equipment() == 'weixin') {
            $scope.paymentTypeList.splice(1, 1);
          }
          //默认选中第一种支付方式
          $timeout(function () {
            if ($scope.paymentTypeList.length) {
              //需付金额不为0的时候默认选中第一种支付方式
              if ($scope.needsPay > 0) {
                var payTypeList = $('.pay-paytype').find('.pay-choosePaymentPlatform');
                var fisrtPayType = payTypeList[0];
                $(fisrtPayType).attr('checked', true);
              }
            }

            //设置单选框居中
            var paymentRow = $('.pay-type-block').find('.pay-row-content');
            for (var index = 0; index < paymentRow.length; index++) {
              var paymentRowContent = paymentRow[index];
              var rowWidth = $(paymentRowContent).width();
              var paymentInfoArray = $(paymentRowContent).find('.pay-payment-info');
              var paymentInfo = paymentInfoArray[0];
              $(paymentInfo).css({
                'width': rowWidth - 40 + 'px'
              });

              var paymentInfoHeight = $(paymentInfo).height();
              var payPaymentRadioArray = $(paymentRowContent).find('.pay-payment-seletced');
              var payPaymentRadio = payPaymentRadioArray[0];
              $(payPaymentRadio).css({
                'margin-top': paymentInfoHeight * 0.5 - 15 * 0.5 - 5 + 'px'
              });
            }

          }, 200);

        }
        if (response.code == -1) {
          console.log('参数为空');
        }
        if (response.code == -2) {
          console.log("参数错误");
        }
        if (response.code == -8) {
          sessionStorage.loginLocation = $location.path();
          $state.go('member-personal-login');
        }

        //待页面加载完成之后再寻找对应的留言框
        $timeout(function () {
          var balanceUsed = payCacheService.getProperty("balanceUsed");
          var orders = payCacheService.getProperty("orders");
          var paySelectedPayId = payCacheService.getProperty("paySelectedPayId");
          if (typeof(balanceUsed) != 'undefined' && balanceUsed != null) {
            $scope.banlancePaid = balanceUsed
            //需付金额
            $scope.needsPay = $scope.orderSumPay - $scope.banlancePaid;
          }
          if (typeof(orders) != 'undefined' && orders != null) {
            var remarkDivs = $('.order-table').find('.remark-field');
            for (var index = 0; index < orders.length; index++) {
              var order = orders[index];
              var remarkDiv = remarkDivs[index];
              var remarkText = order.remark == undefined || order.remark == null ? "" : order.remark;
              $(remarkDiv).val(remarkText);
            }
          }


          //默认选中上次用户跳转之前选中的支付方式
          var payTypeList = $('.pay-paytype').find('.choosePaymentPlatform');
          for (var index = 0; index < payTypeList.length; index++) {
            var paymentPlatform = payTypeList[index];
            if ($(paymentPlatform).val() == paySelectedPayId) {
              $(paymentPlatform).attr('checked', true);
            }

          }

          //清除掉缓存的数据
          // payCacheService.setProperty("balanceUsed", undefined);        //清除输入框中的账户余额使用金额
          // payCacheService.setProperty("orders", undefined);             //清除订单数据
          // payCacheService.setProperty("paySelectedPayId", undefined);   //清除选择的支付方式
        }, 200);

        if ($scope.needsPay == 0) {
          $('.pay-type-block').css('background', '#F0F0F0');
          $scope.isChecked = false;
          $("input[name='choosePaymentPlatform']").removeProp('checked');
        } else {
          $('.pay-type-block').css('background', '#FFF');
          $scope.isChecked = false;
          $("input[name='choosePaymentPlatform']").removeAttr('disabled');
        }

      }).error(function (data, status, header, config) {

      });


      //余额输入框金额变化时
      $scope.losefocus = function (obj) {

        //总的支付金额 < 账户余额，如果输入框中的输入的金额大于总的支付金额就自动置为总的支付金额
        if ($scope.orderSumPay < $scope.userBanlance) {
          if ($scope.banlancePaid > $scope.orderSumPay) {
            $scope.banlancePaid = $scope.orderSumPay
          }
        } else {
          //总的支付金额 > 账户余额，如果输入框中的输入金额大于了账户余额，那么自动将输入的金额置为账户余额
          if ($scope.banlancePaid > $scope.userBanlance) {
            $scope.banlancePaid = $scope.userBanlance
          }
        }
        //需付金额
        //$scope.needsPay = $scope.orderSumPay - $scope.banlancePaid;
        getTotalPriceToPay(true);

      };


      //留言输入框失去焦点
      $scope.remarksFinished = function (event, order) {


        //保存用户的留言
        var remarks = $(event.target).val();
        var orderId = order.order_id;
        if (remarks != "" && remarks != undefined) {
          var apiPrams = {'order_id': orderId, 'remark': remarks};
          userService.postRequestWithUrlAndParams('editOrder.action', apiPrams).success(function (response) {
          })
        }

      };

      //请求接口获取使用优惠券后应该支付的总金额
      function getTotalPriceToPay(isChangeBanlancePaid) {
        var orderArray = [];
        var orderList = $('.list-group').find('.pay-order-row');
        for (var index = 0; index < orderList.length; index++) {
          //订单id
          var orderId = $(orderList[index]).find('.pay-order-id').html();

          var couponsArray = [];
          var couponsList = $(orderList[index]).find('.coupons-table-row');
          //获取优惠券
          for (var i = 0; i < couponsList.length; i++) {
            var couponsName = $(couponsList[i]).find('.pay-coupons-name').html();
            var couponsSize = $(couponsList[i]).find('.numbermodify-number').val();

            if (couponsSize != '0') {
              var couponsDict = {};
              couponsDict['name'] = couponsName;
              couponsDict['size'] = couponsSize;
              couponsArray.push(couponsDict);
            }

          }

          //获取订单下商品的orderItem_id
          var orderItemIdArray = [];
          var goodsList = $(orderList[index]).find('.pay-goods-row');
          for (var j = 0; j < goodsList.length; j++) {
            var orderItem_id = $(goodsList[j]).find('.pay-goods-orderitem-id').html();
            orderItemIdArray.push(orderItem_id);
          }

          var orderCouponsDict = {};
          orderCouponsDict['order_id'] = orderId;
          orderCouponsDict['coupons'] = couponsArray;
          orderCouponsDict['goods'] = orderItemIdArray;
          orderArray.push(orderCouponsDict);
        }

        var params = {
          mobile: localStorage.mobile,
          json: JSON.stringify(orderArray)
        };
        userService.postRequestWithUrlAndParams('getOrderByCoupons.action', params).success(function (response) {
          if (response.code == '0') {
            var sumOfUsedCoupons = 0;
            $.each(response.data, function (index, info) {
              sumOfUsedCoupons += parseFloat(info.sum);
            });
            $scope.orderSumPay = parseFloat(sumOfUsedCoupons.toFixed(2));

            if (!isChangeBanlancePaid) {
              //2. 修改了优惠券的数量，需付额＝总额-余额使用额
              if ($scope.userBanlance > $scope.orderSumPay) {
                //账户余额大于支付总额
                $scope.banlancePaid = parseFloat($scope.orderSumPay.toFixed(2));
              } else {
                //账户余额小于支付总额
                $scope.banlancePaid = parseFloat($scope.userBanlance.toFixed(2));
              }
            }
            $scope.needsPay = $scope.orderSumPay - $scope.banlancePaid;
            console.log($scope.needsPay + '123213213');
            if ($scope.needsPay == 0) {
              $('.pay-type-block').css('background', '#F0F0F0');
              $scope.isChecked = true;
              $("input[name='choosePaymentPlatform']").removeProp('checked');
            } else {
              $('.pay-type-block').css('background', '#FFF');
              $scope.isChecked = false;
              $("input[name='choosePaymentPlatform']").removeAttr('disabled');
            }

            var orders = response.data;
            //设置页面上对应的订单以及商品的优惠额
            var orderList = $('.list-group').find('.pay-order-row');
            for (var index = 0; index < orderList.length; index++) {
              //订单id
              var orderId = $(orderList[index]).find('.pay-order-id').html();

              for (var i = 0; i < orders.length; i++) {

                var resOrderId = orders[i].order_id;
                if (resOrderId == orderId) {

                  var orderYouhui = parseFloat(orders[i].yuhui);
                  var orderCoupons = $(orderList[index]).find('.pay-coupons-order-save')[0];
                  var orderYouhuiParents = $(orderList[index]).find('.pay-coupons-order')[0];
                  orderCoupons.innerHTML = orderYouhui;
                  // if (orderYouhui == 0) {
                  //   // orderYouhuiParents.style.display = 'none';
                  // } else {
                  //   orderYouhuiParents.style.display = 'block';
                  // }
                  orderYouhuiParents.style.display = 'block';

                  var goodsList = $(orderList[index]).find('.pay-goods-row');

                  for (var j = 0; j < goodsList.length; j++) {
                    var orderItem_id = $(goodsList[j]).find('.pay-goods-orderitem-id').html();

                    var goodsArray = orders[i].goods;
                    for (var p = 0; p < goodsArray.length; p++) {
                      var goodsOrderItemId = goodsArray[p].orderItem_id;
                      if (orderItem_id == goodsOrderItemId) {
                        var youhui = parseFloat(goodsArray[p].youhui);

                        var youhuiDiv = $(goodsList[j]).find('.pay-coupons-save-money')[0];
                        var youhuiSuperDiv = $(goodsList[j]).find('.pay-coupons-save')[0];
                        youhuiDiv.innerHTML = youhui;
                        // if (youhui == 0) {
                        //   // youhuiSuperDiv.style.display = 'none';
                        // } else {
                        //   youhuiSuperDiv.style.display = 'block';
                        // }
                        youhuiSuperDiv.style.display = 'block';
                      }

                    }

                  }

                }

              }


            }


          }
        });
      }


      //减少优惠券的使用数量
      $scope.minusCouponsNumberAction = function ($event) {
        var elem = $($event.target).next();
        var val = parseFloat(elem.val());
        if (val > 0) {
          elem.val(--val);

          getTotalPriceToPay(false);


          //找到点击的优惠券对应的可以使用的商品
          //var couponsUsedGoodsIdList = [{'goods_id': '402880ec54a953370154a955fa390003', 'goods_price': '1'}]
          //var goodsList = $('.pay-goods-table').find('.pay-goods-row')
          //var couponsUsed = {};
          //for (var i = 0; i < goodsList.length; i++) {
          //
          //  var goodsId = $(goodsList[i]).find('.pay-goods-id').html();
          //
          //  var goodsPrice = []
          //  for (var j = 0; j < couponsUsedGoodsIdList.length; j++) {
          //
          //    var couponsGoodsId = couponsUsedGoodsIdList[j]['goods_id'];
          //    //找到对应的商品，记录商品的价格以及优惠券的金额
          //    if (goodsId == couponsGoodsId) {
          //      goodsPrice.push(couponsUsedGoodsIdList[j]['goods_price']);
          //    }
          //
          //  }
          //
          //  if (goodsPrice.length > 0) {
          //    couponsUsed["couponsSum"] = couponsDiscount;
          //    couponsUsed["couponsType"] = couponsType;
          //    couponsUsed["goodsPriceList"] = goodsPrice;
          //  }
          //}

          //如果是抵数，那么直接找到对应的最大价值的商品
          //var goodsPriceList = couponsUsed["goodsPriceList"];
          //if(goodsPriceList){
          //  //找出该优惠券对应的商品中价值最大的商品
          //  //1.先判断该优惠券是否是抵数
          //  if (couponsType == '抵数') {
          //    if (goodsPriceList.length == 1) {
          //      var price = goodsPrice[0]; //取出商品的价格，从总价格中减去
          //      $scope.needsPay = $scope.needsPay - price >= 0 ? $scope.needsPay - price : 0;
          //    } else {
          //      //找出最大价值的商品价格
          //      var max = Math.max.apply(Math, goodsPriceList);
          //      $scope.needsPay = $scope.needsPay - max >= 0 ? $scope.needsPay - max : 0;
          //    }
          //
          //  } else if (couponsType == '现金') {
          //
          //    //找出最大价值的商品价格
          //    var max = Math.max.apply(Math, goodsPriceList);
          //    //比较商品价格与优惠券可以抵扣的价格
          //    if (parseInt(couponsDiscount) > parseInt(max)){
          //      //如果优惠券抵消额比商品价格高，那么减去商品的价格
          //      $scope.needsPay = $scope.needsPay - max >= 0 ? $scope.needsPay - max : 0;
          //    }else{
          //      //如果优惠券的抵消额比商品的价格低，那么减去优惠券的价格
          //      $scope.needsPay = $scope.needsPay - parseInt(couponsDiscount) >= 0 ? $scope.needsPay - parseInt(couponsDiscount) : 0;
          //    }
          //
          //  }else if(couponsType == '折扣'){
          //    //找出最大价值的商品价格
          //    var max = Math.max.apply(Math, goodsPriceList);
          //    $scope.needsPay =  $scope.needsPay * parseFloat(couponsDiscount).toFixed(2);
          //
          //  }
          //}
        }
      };

      //增加优惠券的使用数量
      $scope.addCouponsNumberAction = function ($event) {
        var elem = $($event.target).prev();
        var val = parseFloat(elem.val());

        //获取当前增加优惠券的类型(现金、打折、抵数)
        var couponsType = $($event.target).parent().parent().find('.pay-coupons-info').find('.pay-coupons-type').html();
        //获取当前增加优惠券的金额(现金数、折扣数、抵数)
        var couponsDiscount = $($event.target).parent().parent().find('.pay-coupons-info').find('.pay-coupons-discount').html();
        //获取当前增加优惠券的名称
        var couponsName = $($event.target).parent().parent().find('.pay-coupons-info').find('.pay-coupons-name').html();
        //获取该类型优惠券的总数量
        var couponsNum = $($event.target).parent().parent().find('.pay-coupons-info').find('.pay-coupons-num').html();
        couponsNum = parseInt(couponsNum);
        //获取该优惠券当前已选择的数量
        var couponsUsedNum = $($event.target).parent().find('.numbermodify-number').val();

        var couponsEnabledUseNum = 0;
        //循环遍历，找到该优惠券其他订单下的使用情况
        var payOrderRowList = $('.order-table').find('.pay-order-row');


        for (var index = 0; index < payOrderRowList.length; index++) {
          var couponsRowList = $(payOrderRowList[index]).find('.coupons-table-row');
          for (var i = 0; i < couponsRowList.length; i++) {

            var showCouponsType = $(couponsRowList[i]).find('.pay-coupons-type').html();
            var showCouponsDiscount = $(couponsRowList[i]).find('.pay-coupons-discount').html();
            var showCouponsName = $(couponsRowList[i]).find('.pay-coupons-name').html();

            if (showCouponsType == couponsType && showCouponsDiscount == couponsDiscount && couponsName == showCouponsName) {
              var showCouponsUsedNum = $(couponsRowList[i]).find('.numbermodify-number').val();
              showCouponsUsedNum = parseInt(showCouponsUsedNum);
              couponsEnabledUseNum += showCouponsUsedNum;
            }

          }

        }

        //找到当前选择增加的优惠券的数量

        var couponsMaxNum = couponsNum - couponsEnabledUseNum + parseInt(couponsUsedNum);

        if (val < couponsMaxNum) {
          elem.val(++val);

          getTotalPriceToPay(false);
          //找到点击的优惠券对应的可以使用的商品,并且和该订单下的商品列表中的商品进行比较
          //var couponsUsedGoodsIdList = $($event.target).parent().find('.pay-coupons-goodsIdList').html()
          ////var couponsUsedGoodsIdList = [{'goods_id': '402880ec54a953370154a955fa390003', 'goods_price': '1'}]
          //var goodsList = $($event.target).parent().parent().parent().parent().parent().find('.pay-goods-row')
          //console.log("**********************")
          //console.log(couponsUsedGoodsIdList);
          //console.log("**********************")
          //var couponsUsed = {};
          //for (var i = 0; i < goodsList.length; i++) {
          //
          //  var goodsId = $(goodsList[i]).find('.pay-goods-id').html();
          //
          //  var goodsPrice = []
          //  for (var j = 0; j < couponsUsedGoodsIdList.length; j++) {
          //
          //    var couponsGoodsId = couponsUsedGoodsIdList[j]['goods_id'];
          //
          //    //找到对应的商品，记录商品的价格以及优惠券的金额
          //    if (goodsId == couponsGoodsId) {
          //      goodsPrice.push(couponsUsedGoodsIdList[j]['goods_price']);
          //    }
          //
          //  }
          //
          //  if (goodsPrice.length > 0) {
          //    couponsUsed["couponsSum"] = couponsDiscount;
          //    couponsUsed["couponsType"] = couponsType;
          //    couponsUsed["goodsPriceList"] = goodsPrice;
          //  }
          //}


          //var goodsPriceList = couponsUsed["goodsPriceList"];
          //console.log(goodsPriceList);
          ////当优惠券商品列表中没有商品可以优惠时(这种情况一般不会出现)
          //if(goodsPriceList){
          ////  找出该优惠券对应的商品中价值最大的商品
          //  //1.先判断该优惠券是否是抵数
          //  if (couponsType == '抵数') {
          //    //如果是抵数，那么直接找到对应的最大价值的商品
          //
          //    //if (goodsPriceList.length == 1) {
          //    //  var price = goodsPrice[0]; //取出商品的价格，从总价格中减去
          //    //  $scope.needsPay = $scope.needsPay - price >= 0 ? $scope.needsPay - price : 0;
          //    //} else {
          //    //  //找出最大价值的商品价格
          //    //  var max = Math.max.apply(Math, goodsPriceList);
          //    //  $scope.needsPay = $scope.needsPay - max >= 0 ? $scope.needsPay - max : 0;
          //    //}
          //
          //    //找出最大价值的商品价格
          //    var max = Math.max.apply(Math, goodsPriceList);
          //    $scope.needsPay = $scope.needsPay - max >= 0 ? $scope.needsPay - max : 0;
          //
          //  } else if (couponsType == '现金') {
          //
          //    //找出最大价值的商品价格
          //    var max = Math.max.apply(Math, goodsPriceList);
          //    //比较商品价格与优惠券可以抵扣的价格
          //    if (parseInt(couponsDiscount) > parseInt(max)){
          //      //如果优惠券抵消额比商品价格高，那么减去商品的价格
          //      $scope.needsPay = $scope.needsPay - max >= 0 ? $scope.needsPay - max : 0;
          //    }else{
          //      //如果优惠券的抵消额比商品的价格低，那么减去优惠券的价格
          //      $scope.needsPay = $scope.needsPay - parseInt(couponsDiscount) >= 0 ? $scope.needsPay - parseInt(couponsDiscount) : 0;
          //    }
          //
          //  }else if(couponsType == '折扣'){
          //    //找出最大价值的商品价格
          //    var max = Math.max.apply(Math, goodsPriceList);
          //    $scope.needsPay =  $scope.needsPay * parseFloat(couponsDiscount).toFixed(2);
          //
          //  }
          //}

        }


      }

      //点击div，实现单选按钮选中
      $scope.onRadioClick = function (obj) {
        if ($scope.needsPay <= 0) {
          $scope.isChecked = true;
        } else {
          var $radio = $(obj).find("input[name='choosePaymentPlatform']");
          if (!$radio.is(':checked')) {
            $radio.prop('checked', 'checked');
          }
        }
      }

      //前往支付
      $scope.payAction = function () {
        //当用户在金额输入框中输入负数时
        if (parseFloat($scope.banlancePaid) < 0) {
          $scope.banlancePaid = 0
          //需付金额
          $scope.needsPay = $scope.orderSumPay - $scope.banlancePaid;
        }

        //获取优惠券的使用情况
        //var orderCouponsInfoList = [];
        //
        //var couponseUsedList = $('.list-group').find('.pay-order-row');
        //
        //for (var index = 0; index < couponseUsedList.length; index++) {
        //
        //  //订单号
        //  var orderId = $(couponseUsedList[index]).find('.pay-order-id').html();
        //  var remark = $(couponseUsedList[index]).find('.remark-field').html();
        //
        //  var goodsIdArray = [];
        //  var goodsDivArray = $(couponseUsedList[index]).find('.pay-goods-row');
        //
        //  for (var i = 0 ; i < goodsDivArray.length;i++){
        //    var goodsDiv = goodsDivArray[i];
        //    var goodsIdDivArray = $('.pay-goods-row').find('.pay-goods-id');
        //    console.log(goodsIdDivArray);
        //    var goodsId = $(goodsIdDivArray[0]).html();
        //    console.log(goodsId);
        //    goodsIdArray.push(goodsId);
        //  }
        //
        //
        //  var order = {"order_id": orderId, "remark": remark,"order_item":goodsIdArray};
        //  orderCouponsInfoList.push(JSON.stringify(order));

        //找到优惠券的使用
        //var couponsInfoList = [];
        //var couponsUsedList = $(couponseUsedList[index]).find('.coupons-table').find('.coupons-table-row');
        //for (var i = 0; i < couponsUsedList.length; i++) {
        //
        //  //获取优惠券的id以及使用的数量
        //  var couponsUsedId = "123456";
        //  var couponsUsedNum = $(couponseUsedList[i]).find('.numbermodify-number').val(); //优惠券使用数量
        //  var couponsUsedType = $(couponseUsedList[i]).find('.pay-coupons-type').html();  //优惠券类型
        //  var couponsUsedDiscount = $(couponseUsedList[i]).find('.pay-coupons-discount').html();  //优惠券金额
        //
        //  //当选择使用了优惠券
        //  if(couponsUsedNum){
        //    var couponsInfo = {};
        //    couponsInfo['id'] = couponsUsedId;
        //    couponsInfo['count'] = couponsUsedNum;
        //    couponsInfo['type'] = couponsUsedType;
        //    couponsInfo['number'] = couponsUsedDiscount;
        //
        //    couponsInfoList.push(couponsInfo);
        //  }
        //}

        //var orderCouponsInfo = {};
        //orderCouponsInfo['no'] = orderNo;
        //orderCouponsInfo['coupons'] = couponsInfoList;
        //orderCouponsInfoList.push(orderCouponsInfo);
        //}

        var orderArray = [];
        var orderList = $('.list-group').find('.pay-order-row');
        for (var index = 0; index < orderList.length; index++) {
          var orderId = $(orderList[index]).find('.pay-order-id').html();
          var remark = $(orderList[index]).find('.remark-field').val();

          //获取优惠券的使用状况
          var couponsArray = [];
          var couponsList = $(orderList[index]).find('.coupons-table-row');
          for (var i = 0; i < couponsList.length; i++) {
            var couponsName = $(couponsList[i]).find('.pay-coupons-name').html();
            var couponsSize = $(couponsList[i]).find('.numbermodify-number').val();

            if (couponsSize != '0') {
              var couponsDict = {};
              couponsDict['name'] = couponsName;
              couponsDict['size'] = couponsSize;
              couponsArray.push(couponsDict);
            }

          }


          //获取商品id
          var goodsIdArray = [];
          var goodsDivArray = $(orderList[index]).find('.pay-goods-row');
          for (var i = 0; i < goodsDivArray.length; i++) {
            var goodsDiv = goodsDivArray[i];
            var goodsIdDivArray = $(goodsDiv).find('.pay-goods-orderitem-id');
            var goodsId = $(goodsIdDivArray[0]).html();
            goodsIdArray.push(goodsId);
          }

          var orderCouponsDict = {};
          orderCouponsDict['order_id'] = orderId;
          orderCouponsDict['coupons'] = couponsArray;
          orderCouponsDict['remark'] = remark;
          orderCouponsDict['orderItem_id'] = goodsIdArray;
          orderArray.push(orderCouponsDict);
        }

        /*
         * sessionStorage.isFrom 表征从那个页面到支付页，方便后台在支付成功后跳转到相应的页面
         * value =  1 购物车
         * value =  2 订单列表
         * value =  3 购买页（商品列表、商品详情）
         * value =  4 订单详情
         */
        var from = sessionStorage.isFrom;
        if (from == 1) from = 'cart';
        if (from == 2 || from == 4) from = 'order';
        if (from == 3) from = 'goods';
        if (from == 6) from = 'reserve';

        //获取用户选择的支付方式
        var paySelectedPayId = $('input:radio:checked').val(); //支付方式id
        if (paySelectedPayId == undefined) {
          paySelectedPayId = "";
        }
        var params = {
          mobile: localStorage.mobile,
          "payment_id": paySelectedPayId,
          "json": JSON.stringify(orderArray),
          "balanceUsed": $scope.banlancePaid,
          'from': from
        };

        //支付
        userService.postRequestWithUrlAndParams("pay.action", params).success(function (response) {

          payCacheService.setProperty("orderId", orderIds);
          payCacheService.setProperty("orders", orderArray);
          payCacheService.setProperty("balanceUsed", $scope.banlancePaid);
          payCacheService.setProperty("paySelectedPayId", paySelectedPayId);

          var resType = typeof response;
          if (resType == 'object') {
            commonService.showErrorMessage(response.data);
          } else {
            sessionStorage.alipayHtml = response;
            $state.go("ali-pay");
          }


        }).error(function (data, status, header, config) {
          commonService.showErrorMessage('支付出错，请联系管理员');
        });


      };

      //返回按钮点击
      $scope.back = function () {
        if (from == 1 || sessionStorage.isFrom == 1) {
          $state.go("member-user-cart", {'from': 0});
        }
        if (from == 2 || sessionStorage.isFrom == 2) {
          $state.go("member-user-myorder", {"from": 1});
        }
        if (from == 3 || sessionStorage.isFrom == 3) {
          localStorage.toPurchase = 4;
          $state.go("service-purchase", {"operate": 4, obj: {}});
        }
        if (from == 4 || sessionStorage.isFrom == 4) {
          $state.go('member-user-orderdetail');
        }
        if (from == 5 || sessionStorage.isFrom == 5) { //购物车
          $state.go('member-user-cart');
        }
        if (from == 6 || sessionStorage.isFrom == 6) { //我的预约单
          $state.go('member-user-reserve');
        }
        if (from == 7 || sessionStorage.isFrom == 7) {  //我的预约单详情
          $state.go('member-user-orderdetail');
        }

      };

    });


//在线超市
guanjiaModuleController.controller('shoppingCtrl', ['$scope', 'guanjiaService', 'commonService', '$sce', '$cookies', '$state', '$q', function ($scope, guanjiaService, commonService, $sce, $cookies, $state, $q) {
  //%comservice% 首页   %guanggao% 广告
  $scope.from = $cookies.get('from');

  function getListMarket() {
    var defer = $q.defer();
    guanjiaService.listMarket().success(function (response) {
      if (response.code == '0') {
        if (response.data != null) {
          $scope.segItems = response.data;
          defer.resolve($scope.segItems);
          $scope.record(response.data[0].market_id);
        }
      }
    });
    return defer.promise;
  };
  $scope.shoppingPromise = getListMarket();

  $scope.marketShow = function (item) {
    $scope.record(item.market_id);
  };

  $scope.record = function (mId) {
    guanjiaService.recordMarket({
      market_id: mId,
      ticket: $cookies.get('ticket')
    }).success(function (response) {
      if (response.code != '0') {
        commonService.showWarnMessage(response.data);
      }
    });
  };

  //返回
  $scope.goBack = function () {

    if ($scope.from == '%comservice%') {
      $state.go('guanjia-comservice');
    }
    if ($scope.from == '%guanggao%') {
      $state.go(localStorage.adRoute);
      $cookies.put('from', 'toBack');
    }

  }

}]);

//支付页面
guanjiaModuleController.controller('alipayCtrl', ['$scope', 'guanjiaService', '$sce', '$stateParams', '$state', '$cookies', function ($scope, guanjiaService, $sce, $stateParams, $state, $cookies) {

  $(".alipay-html").html(sessionStorage.alipayHtml);

  $scope.backPay = function () {
    $state.go('guanjia-pay', {from: 10, obj: {}});
  }

}]);

guanjiaModuleController.controller('loginRedirectCtrl', function ($scope) {
  $(".alipay-html").html(sessionStorage.alipayHtml);
});

//家庭服务
guanjiaModuleController.controller('familyserviceCtrl', ['$scope', 'guanjiaService', 'commonService', '$q', 'userService', '$state', '$cookies', '$stateParams', '$rootScope', function ($scope, guanjiaService, commonService, $q, userService, $state, $cookies, $stateParams, $rootScope) {
//请求定位接口
  if ($stateParams.target != null) localStorage.target = $stateParams.target;
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
    if (null != $stateParams.target) localStorage.target = $stateParams.target;
    $scope.imgShow = true;//标志着广告数据未加载
    $scope.myInterval = parseInt($rootScope.shuffling) * 1000; //设置轮播图的图片切换时间
    if ($cookies.get('from') == '%guanggao%') {
      $scope.from = $cookies.get('from');
    } else if ($cookies.get('from') == 'toBack') { //广告跳转后再返回到本页
      $scope.from = localStorage.prevFrom;
      localStorage.removeItem('prevFrom');
      $cookies.put('from', '%jiating%');
    } else {
      if (typeof $stateParams.label != 'undefined')
        $scope.label = $stateParams.label;
      $cookies.put('from', '%jiating%');
      $scope.from = $stateParams.from; //from  0:家庭服务  1:干洗到家
    }
    $scope.tabIndex = $rootScope.supportTabIndex == undefined ? 0 : $rootScope.supportTabIndex;
    $scope.familyserviceContent = '';
    function getCityService() {
      var defer = $q.defer();
      $scope.tabCount = [];//存放选项卡index
      guanjiaService.listCityService({
        city_id: sessionStorage.gpscityId,
        type: '家庭服务'
      }).success(function (response) {
        if (response.data.length > 0 && response.code == '0') {
          $scope.familyserviceContent = '';//有城市服务数据
          $scope.serviceType = response.data;
          defer.resolve($scope.serviceType);
          //获取服务id和index分别存入数组$scope.fuwu和tabCount
          $scope.fuwu = [];
          $scope.tabCount = [];
          $.each($scope.serviceType, function (index, info) {
            $scope.tabCount.push(index);
            $scope.fuwu.push(info.city_fuwu_id);
          });

          if ($scope.from != '1') {             //不是从热门服务进来的
            var intiInde;
            //从广告跳转过来
            if ($scope.from == '%guanggao%') {
              var tabItem = $cookies.get('name');
              $.each($scope.serviceType, function (index, info) {
                if (info.name == tabItem) {
                  intiInde = index;
                  $scope.tabIndex = index;
                  //控制卡头默认选中（在html中通过指令change-service控制）
                  //$rootScope.supportTabIndex = index;

                  return false;
                }
              });
              if (intiInde == undefined) {
                commonService.showWarnMessage('家庭服务的' + tabItem + '选项卡不存在！');
                $state.go(localStorage.adRoute);
                $cookies.put('from', 'toBack');
                return;
              }
            } else {
              $.each($scope.serviceType, function (index, info) {
                if (info.label == $scope.label) {
                  $scope.tabIndex = intiInde = index;
                  return false;
                }
              });
              intiInde = null == $scope.tabIndex ? 0 : $scope.tabIndex;
            }
            $scope.businessParams.city_fuwu_id = $scope.serviceType[intiInde].city_fuwu_id;
            //请求分类完成之后获取选择的分类的商家数据（初始化页面的时候默认选择第一个分类）
            $scope.label = $scope.serviceType[intiInde].label;
            getAdverts();   //轮播图
            getNotice();    //公告

            if ($scope.serviceType[intiInde] == 0) {
              $scope.isShowPrompt = true;
              getPrompt($scope.serviceType[intiInde].city_fuwu_id); //提示
            } else {
              $scope.isShowPrompt = false;
            }

          } else if ($scope.from == '1') {      //否则按是处理
            $scope.drycleanFuwu_id = $rootScope.hotFuwu_id;
            $scope.businessParams.city_fuwu_id = $scope.drycleanFuwu_id;


            // 早餐所对应的index
            $.each($scope.fuwu, function (i, value) {
              if (value == $scope.drycleanFuwu_id) {
                $scope.drycleanIndex = i;
              }
            });

            getAdverts();
            getNotice();
            if ($scope.serviceType[$scope.drycleanIndex].config == 0) {
              $scope.isShowPrompt = true;
              getPrompt($scope.serviceType[$scope.drycleanIndex].city_fuwu_id);
            } else {
              $scope.isShowPrompt = false;
            }

          }


          $scope.business_family = [];
          $scope.businessLis($scope.businessParams);
        } else {//无数据
          $scope.familyserviceContent = '没有相关数据！';//无城市服务数据
        }
      });
      return defer.promise;
    }

    //动态获取选项卡和商家数据
    $scope.service_promise = getCityService();
    /*****************获取商家列表*****************************************/
    //获取服务商家列表
    $scope.businessParams = {
      city_id: sessionStorage.gpscityId,
      city_fuwu_id: "",
      pageno: '1', //页码
      pagesize: '15', //页数
      url: 'listBusiness.action',
      direction: 'up',
      key: ''
    };
    $scope.business_family = [];
    var isOver = false; //false:标志数据未加载完成
    $scope.familyserviceList = true;
    $scope.businessLis = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        var tempList = response.data.list;
        $scope.allBusiness = response.data;
        if (tempList.length == 0 && params.pageno == '1') {
          $scope.familyserviceList = false;//无商家列表数据
        } else {
          $scope.familyserviceList = true;//有商家列表数据
        }
        if (tempList.length < params.pagesize) {
          isOver = true;//true:标志数据加载完成
          defer.resolve(isOver);
        } else {
          isOver = false;
          defer.resolve(isOver);
        }
        if (params.direction == 'down') {
          $scope.business_family = tempList;
        } else {
          $scope.business_family = $scope.business_family.concat(tempList);
        }

      });
      return defer.promise;
    };

    /*************************************页面事件监听******************************************/

    $scope.goStationIntro = function () {
      $state.go('member-about-stationintro', {fuwu_id: $scope.businessParams.city_fuwu_id});
    };
    //点击选项卡，切换内容
    $scope.change_tab = function (fuwu) {
      $('.search-input').val('');
      $scope.slides = "";
      $scope.businessParams.city_fuwu_id = fuwu.city_fuwu_id;
      $scope.business_family = [];
      $scope.label = fuwu.label; //设置等于卡头的label
      $scope.isShowPrompt = false;
      $scope.businessLis($scope.businessParams);
      getAdverts();
      getNotice();
      if (!fuwu.config) {
        $scope.isShowPrompt = true;
        getPrompt(fuwu.city_fuwu_id);
      } else {
        $scope.isShowPrompt = false;
      }

    };

    /**
     * 关键字搜索
     */
    var val = '';
    //点击关键字搜索按钮
    $scope.searchFamilyBusiness = function () {
      $scope.business_family = [];
      val = $('.search-input').val();
      $scope.businessParams.pageno = '1';
      $scope.businessParams.key = val;
      $scope.businessLis($scope.businessParams);
    };
    //失去焦点，获取key的内容
    $scope.serviceBlur = function () {
      $scope.businessParams.key = $('.search-input').val();
    };

    //点击返回按钮
    $scope.goBack = function () {
      val = $('.search-input').val();
      if (val != '') {
        $('.search-input').val('');
        $scope.searchFamilyBusiness();
      }
      else if ($cookies.get('from') == '%jiating%') {
        $state.go('guanjia-comservice');
        $rootScope.supportTabIndex = null;
      }
      else if ($cookies.get('from') == '%guanggao%') {
        $state.go(localStorage.adRoute);
        $cookies.put('from', 'toBack');
      }


    };

    /*************************************   end   ******************************************/
    //点击商家，跳转到服务列表页
    //$scope.goServiceList = function (businessId, businessName) {
    //  $state.go('guanjia-familyservicelist', {
    //    businessId: businessId,
    //    businessName: businessName
    //  });
    //  sessionStorage.businessId = businessId;
    //  sessionStorage.businessName = businessName;
    //};


    $scope.goServiceList = function (businessId) {
      localStorage.removeItem('skip');
      //默认选项卡为全部
      localStorage.showType = '0';
      //如果是从广告跳转到家庭服务页，点击服务列表时，清除$cookies.get('from')
      if ($scope.from == '%guanggao%') {
        $cookies.put('from', '%jiating%');
      }
      $state.go('guanjia-familyservicelist');
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      if (null == businessId) {
        $cookies.put('city_fuwu_id', $scope.businessParams.city_fuwu_id, {'expires': expireDate.toUTCString()}); //存入当前城市的服务id
      } else {  //如果商家存在，说明不是从所有商家进去的，就清除city_fuwu—id
        $cookies.remove('city_fuwu_id');
      }
      //存放商家ID
      $cookies.put('businessId', businessId, {'expires': expireDate.toUTCString()});
    };


    /**************************************初始化轮播图，跑马灯，提示数据***************************************/


    /**
     * 广告轮播图
     */
    function getAdverts() {
      var promise = guanjiaService.getAdverts($scope.label);
      promise.then(function (data) {
        if (data.length > 0) {
          $scope.slides = data;
          //轮播图请求到数据1秒后显示
          setTimeout(function () {
            $scope.imgShow = false;
          }, 1000);
        }
      });
    }


    /**
     *  获取公告数据
     */
    function getNotice() {
      var noticeParams = {
        type: 'system,city',
        city_id: sessionStorage.gpscityId,
        label: $scope.label
      };
      guanjiaService.getNotice(noticeParams).then(function (data) {
        if (data != null && data.length > 0) {
          var marqueeContent = '';
          for (var i = 0; i < data.length; i++) {
            marqueeContent += '<li>' + data[i].content + '<li>';
          }
          marqueeContent = "<marquee behavior='scroll'  scrollAmount='" + $scope.slide + "'>" +
              "<ul class='list-inline' style='white-space: nowrap'>" + marqueeContent + "</ul></marquee>";
          $('.marquee-broadcast').html(marqueeContent);
          $('.marquee-broadcast').css('display', 'block');
        } else {
          $('.marquee-broadcast').css('display', 'none');
        }
      }, function (err) {
        $state.go('guanjia-comservice');
      });
    }

    /**
     * 获取城市服务提示数据
     */
    function getPrompt(fuwu_id) {
      var params = {
        fuwu_id: fuwu_id
      };
      guanjiaService.getCityServicePrompt(params).then(function (reponse) {
        if (reponse.data != null) {
          switch (reponse.data.code) {
            case '0':
              $scope.promptData = reponse.data.data;
              break;
            case '1':
              console.log("参数为空!");
              break;
            case '2':
              console.log("参数错误!");
              break;
          }
        }
      }, function (error) {
        commonService.showErrorMessage("请求错误,请稍后再试~")
      });
    }


    //点击广告前往广告详情
    $scope.adToDetail = function (index) {
      var adObject = $scope.slides[index];
      //记住跳转前的$scope.from的值
      if ($stateParams.from == '0' || $stateParams.from == '1') {
        localStorage.prevFrom = $stateParams.from;
      }
      localStorage.target = "ad";
      userService.adLinkTo("guanjia-familyservice", adObject);
      if (adObject.category == '动态') commonService.addAdLog(adObject);
    };

    /****************************************  end  ****************************************************/

  })


}]);

//服务详情
guanjiaModuleController.controller('familyservicedetailCtrl', ['$scope', '$stateParams', 'guanjiaService', '$interval', '$q', '$state', '$cookies', '$sce', 'commonService', function ($scope, $stateParams, guanjiaService, $interval, $q, $state, $cookies, $sce, commonService) {
  if (null != $stateParams.target) localStorage.target = $stateParams.target;
  $scope.imgShow = false; //标志轮播图数据还未加载
  $scope.errMsg = '';
  $scope.serviceDetaildescription = true;
  function getServiceDetail() {
    var defer = $q.defer();
    guanjiaService.goodsDetail({
      goods_id: $stateParams.goodsId
    }).success(function (response) {
      if (response.code == '0') {

        $scope.serviceDetail = response.data;
        defer.resolve($scope.serviceDetail);

        //商品开卖倒计时
        $scope.countdown = $scope.serviceDetail.now_date;
        if ($scope.countdown != '') {
          var time = Math.floor($scope.countdown / 1000);
          var showTime = $interval(function () {
            var timeDiffer = $scope.countdown;
            if (time < 1) {
              $interval.cancel(showTime);
            } else {
              // 天
              var int_day = Math.floor(timeDiffer / 86400000);
              timeDiffer -= int_day * 86400000;
              // 时
              var int_hour = Math.floor(timeDiffer / 3600000);
              timeDiffer -= int_hour * 3600000;
              // 分
              var int_minute = Math.floor(timeDiffer / 60000);
              timeDiffer -= int_minute * 60000;
              // 秒
              var int_second = Math.floor(timeDiffer / 1000);
              // 时分秒为单数时、前面加零
              if (int_day < 10) {
                int_day = "0" + int_day;
              }
              if (int_hour < 10) {
                int_hour = "0" + int_hour;
              }
              if (int_minute < 10) {
                int_minute = "0" + int_minute;
              }
              if (int_second < 10) {
                int_second = "0" + int_second;
              }

              $scope.showTimeHtml = '开卖倒计时：' + int_day + '天' + int_hour + '时' + int_minute + '分' + int_second + '秒';
              $scope.countdown -= 1000;
              time--;
            }
          }, 1000);
        } else {
          $('.count_down').css({
            'height': '2px'
          })
        }

        var priceR = $scope.serviceDetail.priceRange;
        $scope.showSaleP = false; //false:显示销售价格范围
        $scope.showOldP = false;//false:显示原价格范围
        if (!priceR.min_sale_price) {
          $scope.showSaleP = true;
        }
        if (priceR.min_sale_price == priceR.max_sale_price) {
          $scope.showSaleP = true;
        }
        if (!priceR.min_old_price) {
          $scope.showOldP = true;
        }
        if (priceR.min_old_price == priceR.max_old_price) {
          $scope.showOldP = true;
        }
        $scope.slides = $scope.serviceDetail.goods_images;
        //if ($scope.slides != '') {
        //  //轮播图请求到数据1秒后显示
        //  setTimeout(function () {
        //    $scope.imgShow = false;
        //  }, 1000);
        //}

        if ($scope.slides.length > 0) {
          $scope.imgShow = true;//true:标志轮播图数据加载完成
        }


        if ($scope.serviceDetail.description) {

          $scope.serviceDetaildescription = $sce.trustAsHtml($scope.serviceDetail.description);
        } else {
          $scope.serviceDetaildescription = false;
          $scope.errMsg = '无相关数据！';
        }
      } else {
        commonService.showErrorMessage('服务详情接口有错误！请联系管理员');
        $state.go('guanjia-comservice');
      }
    });
    return defer.promise;
  }

  //服务详情
  $scope.detailPromise = getServiceDetail();
  //评价
  guanjiaService.listGoodsComment({
    goods_id: $stateParams.goodsId
  }).success(function (response) {

    switch (response.code) {
      case '0':
        if (response.data != '') {

          $scope.evaluateContent = true;
          //评价星星图
          $scope.serviceComment = response.data;
          for (var i = 0; i < $scope.serviceComment.length; i++) {//实心星星
            $scope.serviceComment[i].lightstarimgObj = '';
            $scope.serviceComment[i].starimgObj = '';
            for (var j = 0; j < $scope.serviceComment[i].star; j++) {
              var img = '<img src="images/lightstar.png">';
              $scope.serviceComment[i].lightstarimgObj += img;
            }
            for (var z = 0; z < $scope.serviceComment[i].star; z++) {//空心星星
              var img = '<img src="images/star.png">';
              $scope.serviceComment[i].starimgObj += img;
            }
          }
        } else {
          $scope.evaluateContent = false;
          $scope.errMsg = '无相关数据！';
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

  //销量
  guanjiaService.getGoodsCount({
    goods_id: $stateParams.goodsId
  }).success(function (response) {
    if (response.data != '') {

      $scope.chartsContent = true;
      var _labels = [];
      for (var i = 0; i < response.data.labels.length; i++) {
        var s = response.data.labels[i].slice(-2);
        if (i % 2) {//奇数
          _labels.push('');
        } else {//偶数
          _labels.push(s);
        }
      }
      $scope.labels = _labels;

      $scope.salesData = [
        response.data.data
      ];
      //$scope.onClick = function (points, evt) {
      //  console.log(points, evt);
      //};
      $scope.options = {
        showTooltips: false
      }
    } else {
      $scope.chartsContent = false;
      $scope.errMsg = '无相关数据！';

    }
  });

  //点击预约，跳转到服务预约页
  $scope.goServiceReserve = function () {
    sessionStorage.reserveGoodsId = $stateParams.goodsId;
    sessionStorage.stackIndex = 1;
    $state.go('guanjia-servicereserve', {
      operate: 1,
      obj: {
        goodsId: $stateParams.goodsId
      }
    });
  }

  $scope.back = function () {
    if (localStorage.goodsDetailFrom == "%goodsList%") {
      //回到服务列表
      //记录当前页的标识符
      localStorage.skip = 'detail';
      var bussinessId = sessionStorage.businessId;
      var bussinessName = sessionStorage.businessName;
      $state.go("guanjia-familyservicelist", {
        "businessId": bussinessId,
        "bussinessName": bussinessName
      })
    }
    else if (localStorage.goodsDetailFrom == "%guanggao%") {
      $state.go(localStorage.adRoute);
    }
    else if (localStorage.goodsDetailFrom == "%couponsSeller%") {
      $state.go('guanjia-goodslist');
    }
    else if (localStorage.goodsDetailFrom == '%orderDetail%') {
      localStorage.skip = 'detailList';
      $state.go('member-user-orderdetail');
    }
    else if (localStorage.goodsDetailFrom == '%cartList%') {
      var temp = localStorage.skip.split(':')[0];
      $state.go('member-user-cart', {from: temp});
    }
    else if (localStorage.goodsDetailFrom == "%reserveList%") {
      localStorage.skip = 'orderList';
      $state.go('member-user-reserve');
    }
  }

}]);

//服务预约
guanjiaModuleController.controller('servicereserveCtrl', ['$scope', 'guanjiaService', '$stateParams', 'commonService', '$state', '$timeout', 'userService', '$cookies', '$rootScope', 'reserveCacheService', '$location', function ($scope, guanjiaService, $stateParams, commonService, $state, $timeout, userService, $cookies, $rootScope, reserveCacheService, $location) {

  //联系人输入框与联系电话输入框默认为当前的登陆用户的信息
  $scope.userName = ($rootScope.username == localStorage.mobile || $rootScope.username == undefined) ? "" : $rootScope.username;
  $scope.telephone = localStorage.mobile == undefined ? "" : localStorage.mobile

  /*
   * superControl = 0 从服务列表跳转过来
   * superControl = 1 从服务详情跳转过来
   */
  var stackIndex = sessionStorage.stackIndex;

  /*
   * operate = 3 从选择小区跳转回来
   */
  var operate = $stateParams.operate;


  //隐藏选择服务站的按钮
  $scope.showSelectServiceStation = false;


  if ($cookies.get('ticket') != null) {
    guanjiaService.count({
      ticket: $cookies.get('ticket')
    }).success(function (response) {
      "use strict";
      if (response.code == '0') {
        $scope.cartCount = parseInt(response.data.appointment_cart_size + response.data.order_cart_size);
      } else {
        commonService.showErrorMessage(response.data);
      }
    });
  }

  $scope.goCart = function () {
    localStorage.skip = '预约';
    $state.go('member-user-cart', {from: 0});
  };


  var params = $stateParams.obj;
  guanjiaService.goodsDetail({
    "goods_id": sessionStorage.reserveGoodsId,
    'service_station_id': sessionStorage.selectedServiceStationId,
    'buy': '1',
    'ticket': $cookies.get('ticket')
  }).success(function (response) {
    if (response.code == '0') {
      $scope.serviceReserve = response.data;
      $scope.count = $scope.serviceReserve.cart == undefined ? 1 : $scope.goods.cart.count;
      $scope.remarks = $scope.serviceReserve.cart == undefined ? "" : $scope.goods.cart.remark;

      //设置送货方式
      $scope.delivery = response.data.delivery;
      //默认选中第一个
      if (response.data.delivery.length > 0) {
        $scope.currentSelectedDeliveryId = $scope.delivery[0].delivery_id;

        setTimeout(function () {

          //遍历页面显示的送货方式
          var options = $('#purchase-delivery option');

          //遍历请求到的送货方式
          var isHadSelected = false; //是否有默认选中的送货方式
          if ($scope.delivery != undefined) {
            for (var i = 0; i < $scope.delivery.length; i++) {
              var isSelected = $scope.delivery[i].isSelected;
              if (isSelected) {
                var selctedDeliveryName = $scope.delivery[i].name;
                var selctedDeliveryId = $scope.delivery[i].delivery_id;

                for (var index = 0; index < options.length; index++) {
                  var option = options[index];
                  var value = option.value;
                  var text = option.text
                  if (text == selctedDeliveryName && selctedDeliveryId == value) {
                    //根据该字段是否隐藏选择服务站按钮
                    if (text.indexOf('服务站') != -1) {
                      $scope.showSelectServiceStation = true;
                    }
                    $scope.currentSelectedDeliveryId = value;  //存储当前选中的送货方式的id
                    isHadSelected = true;
                    break;
                  }

                }

              }
            }
          }
          //如果没有默认的送货方式，那么就默认选中第一个非空的送货方式
          if (!isHadSelected) {
            for (var index = 0; index < options.length; index++) {
              var option = options[index];
              var value = option.value;
              var text = option.text
              if (text == '' || value.indexOf('?') != -1) {
                option.remove();
              } else {
                //根据该字段是否隐藏选择服务站按钮
                if (text.indexOf('服务站') != -1) {
                  $scope.showSelectServiceStation = true;
                }
                $scope.currentSelectedDeliveryId = value;  //存储当前选中的送货方式的id
                option.selected = true;
                return;
              }

            }
          }


          var deliveryW = $('.purchase-express-type').width();
          var rowW = $('.purchase-bottom').width();
          $('.purchase-selct-servicestation').css({
            'width': rowW - deliveryW - 10 + 'px'
          })
        }, 100);


        //当送货方式为服务站提货的时候才显示选择服务站的按钮
        if ($scope.delivery[0].name.indexOf('服务站') > -1) {
          $scope.showSelectServiceStation = true;
        }
      }


      //获取用户上次选中的服务站，如果没有那么那么就从本地取出
      var currentServiceStation = response.data.service_station;
      if (currentServiceStation == "" || currentServiceStation == undefined) {
        $scope.stationName = "选择服务站";
        $scope.stationId = "";
      } else {
        $scope.stationName = currentServiceStation.station_name;
        $scope.stationId = currentServiceStation.service_station_id;
      }


      var currentCommmunity = response.data.user_communtiy;
      if (currentCommmunity == "" || currentCommmunity == undefined) {
        $scope.userName = ($rootScope.username == localStorage.mobile || $rootScope.username == undefined) ? "" : $rootScope.username;
        $scope.telphone = localStorage.mobile;
        $scope.community = "";
        $scope.communityId = "";
        $scope.floor = "";
      } else {
        $scope.userName = currentCommmunity.username;
        $scope.telephone = currentCommmunity.telphone;
        $scope.community = currentCommmunity.community_name;
        $scope.floor = currentCommmunity.number;
        $scope.communityId = currentCommmunity.community_id;
      }


      //获取商品的价格以及库存
      setTimeout(function () {

        //默认选中用户上次选中的规格（从服务器获取到的上次选中数据）
        var isHasLastSelectedWeekSpec = false;
        var isHadLastSelctedOtherSpec = false;
        var specArray = response.data.guige;
        if (specArray != "" && specArray != undefined) {

          var weekSpecArray = [];
          var otherSpecArray = [];
          for (var p = 0; p < specArray.length; p++) {

            var specObject = specArray[p];
            if (p == 0) {
              weekSpecArray = specObject.value;
            } else {
              otherSpecArray = specObject.value;
            }

          }

          var selectList = $('.purchase').find('.guigeSelect');
          for (var m = 0; m < selectList.length; m++) {

            var select = selectList[m];
            var specName = $(select).attr('name');
            if (m == 0) {

              for (var g = 0; g < weekSpecArray.length; g++) {
                var specValueObject = weekSpecArray[g];
                if (specValueObject.isSelected) {
                  $(select).val(specValueObject.guige_id);
                  isHasLastSelectedWeekSpec = true;
                }
              }

            } else {

              for (var h = 0; h < otherSpecArray.length; h++) {
                var specValueObject = otherSpecArray[h];
                if (specValueObject.isSelected) {
                  $(select).val(specValueObject.guige_id);
                  isHadLastSelctedOtherSpec = true;
                }
              }
            }


          }

        }

        //页面上没有默认选中的星期规格，那么此时选中第一个
        if (!isHasLastSelectedWeekSpec) {
          //找到页面上显示星期规格的select
          var guigeList = $('.purchase').find('.guigeList');
          for (var index = 0; index < guigeList.length; index++) {
            var sepcDiv = guigeList[index];
            var sepcNameDivs = $(sepcDiv).find('.purchase-spec-name');
            var sepcNameDiv = sepcNameDivs[0];
            var sepcName = $(sepcNameDiv).html();
            if (sepcName == '星期：') {
              var select = $(sepcDiv).find('.guigeSelect')[0];
              for (var i = 0; i < select.options.length; i++) {
                if (i == 0) {
                  select.options[i].selected = true;
                  break;
                }
              }
            }
          }
        }
        //如果后台没有默认选中的其他规格，那么选中第一个
        if (!isHadLastSelctedOtherSpec) {
          //找到页面上显示星期规格的select
          var guigeList = $('.purchase').find('.guigeList');
          for (var index = 0; index < guigeList.length; index++) {
            var sepcDiv = guigeList[index];
            var sepcNameDivs = $(sepcDiv).find('.purchase-spec-name');
            var sepcNameDiv = sepcNameDivs[0];
            var sepcName = $(sepcNameDiv).html();
            if (sepcName != '星期：') {
              var select = $(sepcDiv).find('.guigeSelect')[0];
              for (var i = 0; i < select.options.length; i++) {
                if (i == 0) {
                  select.options[i].selected = true;
                  break;
                }
              }
            }
          }
        }


        //获取默认选中的规格
        var guige_1 = '';
        var guige_2 = '';
        var guigeIds = '';
        var guigeList = $('.servicereserve-content').find('.guigeList');
        for (var index = 0; index < guigeList.length; index++) {
          if (index == 0) {
            var sepcDiv = guigeList[index];
            var select = $(sepcDiv).find('.guigeSelect')[0];
            for (var i = 0; i < select.options.length; i++) {
              if (select.options[i].selected == true) {
                guige_1 = select.options[i].value;
                break;
              }
            }
          }
          if (index == 1) {
            var sepcDiv = guigeList[index];
            var select = $(sepcDiv).find('.guigeSelect')[0];
            for (var i = 0; i < select.options.length; i++) {
              if (select.options[i].selected == true) {
                guige_2 = select.options[i].value;
                break;
              }
            }
          }

        }

        if (guige_1 != '' && guige_2 != '') {
          guigeIds = guige_1 + ',' + guige_2;
        }
        if (guige_1 == '' && guige_2 != '') {
          guigeIds = guige_2;
        }
        if (guige_1 != '' && guige_2 == '') {
          guigeIds = guige_1;
        }


        //根据当前的服务站以及规格获取库存以及价格
        guanjiaService.getPriceAndInventory({
          'guige_id': guigeIds,
          'goods_id': sessionStorage.reserveGoodsId,
          'service_station': sessionStorage.selectedServiceStationId
        }).success(function (res) {

          if (res.code == 0) {
            $scope.salePrice = res.data.sale_price;
            $scope.oldPrice = res.data.old_price;
            $scope.serviceReserve.inventory = res.data.inventory;

            //从缓存加载数据
            loadDatafromCache();
            //从缓存中获取到用户之前选择的商品的数量后计算商品的总价
            $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
          } else {
            commonService.showErrorMessage(res.data);
          }
        }).error(function (data, status, header, config) {
          commonService.showErrorMessage('系统错误');
        });
      }, 500);


    } else {
      commonService.showErrorMessage(response.data);
    }
  });

  //数量加减
  $scope.decrease = function () {
    if ($scope.count > 1) {
      $scope.count -= 1;
    }
    $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
  };
  $scope.increase = function () {
    $scope.count = parseInt($scope.count) + 1;
    $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
  };
  //输入负数和小数点
  $scope.inputChange = function ($event) {
    var elem = $($event.target);
    if (elem.val() == null || elem.val().trim() == '') {
      //总额不要让显示为NaN非数字
    }
    var val = parseFloat(elem.val());
    var regx = /^-?([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0)$/;
    if (val < 1 || regx.test(val)) {
      $scope.count = 1;
    }
    $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
  };


  function saveInfoToCache() {

    //获取规格属性
    //获取规格并保存
    var guige_1 = '';
    var guige_2 = '';
    var selectList = $('.servicereserve-content').find('.guigeSelect');
    selectList.each(function (index, select) {
      if (index == 0) {
        guige_1 = $(select).find("option:selected").val();
      } else {
        guige_2 = $(select).find("option:selected").val();
      }
    });

    //在前往选择我的小区之前将当前的页面信息保存在reserveCacheService中
    reserveCacheService.setProperty("selectedCount", $scope.count);  //保存用户当前输入的商品件数
    reserveCacheService.setProperty("remarks", $scope.remarks);     //保存用户输入的留言
    reserveCacheService.setProperty("userName", $scope.userName);     //保存联系人姓名
    reserveCacheService.setProperty("telephone", $scope.telephone);   //保存联系人电话
    reserveCacheService.setProperty("community", $scope.community);  //保存小区名称
    reserveCacheService.setProperty("floor", $scope.floor);           //保存楼房号
    reserveCacheService.setProperty("deliveryId", $scope.currentSelectedDeliveryId);          //送货方式的id
    reserveCacheService.setProperty("guige1", guige_1);
    reserveCacheService.setProperty("guige2", guige_2);

  }

  //从缓存中读取信息
  function loadDatafromCache() {
    /*
     *  选择其他信息完成后回到服务预约页,因为选择服务站以及我的小区都会讲选择的信息上传至服务器,回到该页面的时候再从服务器读取,因此这里在
     *  选择服务站以及我的小区后不需要进行其他操作,而在选择小区后需要显示选择的小区信息
     *
     * from = 1; 选择服务站完成返回到购买页
     * from = 2; 选择我的小区完成返回到购买页
     * from = 3; 选择小区完成返回到购买页
     *
     * localStorage.reserveFrom = 5, 未登录时前往登录
     */


    var from = localStorage.backReserve;
    if (from != undefined) {

      //选择小区完成
      if (from == 3 || localStorage.reserveFrom == 5) {
        var userName = reserveCacheService.getProperty("userName");
        var telephone = reserveCacheService.getProperty("telephone");
        var floor = reserveCacheService.getProperty("floor");
        var community = reserveCacheService.getProperty("community");
        var communityId = reserveCacheService.getProperty("communityId");


        $scope.userName = userName;
        $scope.telephone = telephone;
        $scope.floor = floor;
        $scope.community = community;
        $scope.communityId = communityId;
      }

      var selectedCount = reserveCacheService.getProperty("selectedCount");
      var remarks = reserveCacheService.getProperty("remarks");
      var stationName = reserveCacheService.getProperty("stationName");
      var stationId = reserveCacheService.getProperty("stationId");
      var guige1 = reserveCacheService.getProperty("guige1");
      var guige2 = reserveCacheService.getProperty("guige2");

      $scope.count = selectedCount == undefined ? 1 : selectedCount; //给初始值1
      $scope.remarks = remarks == undefined ? "" : remarks;          //给初始值""
      $scope.currentSelectedDeliveryId = reserveCacheService.getProperty("deliveryId");
      $scope.stationName = stationName == undefined ? "选择服务站" : stationName;
      $scope.stationId = stationId == undefined ? "" : stationId;

      var selectList = $('.servicereserve-content').find('.guigeSelect');
      selectList.each(function (index, select) {
        if (index == 0) {
          $(select).val(guige1);
        } else {
          $(select).val(guige2);
        }
      });

    }

  }


  //修改送货方式
  $scope.selChange = function () {

    //找到当前的送货方式
    $scope.currentSelectedDeliveryId = $('#purchase-delivery option:selected').val();
    for (var index = 0; index < $scope.delivery.length; index++) {
      var delivery = $scope.delivery[index];
      if (delivery.delivery_id == $scope.currentSelectedDeliveryId) {
        //找到当前选中的送货方式
        var deliveryName = delivery.name;
        if (deliveryName.indexOf('服务站') > -1) {
          //显示选择服务站的按钮
          $scope.showSelectServiceStation = true;
        } else {
          $scope.showSelectServiceStation = false;
        }
      }
    }

  }


  //修改规格
  $scope.changeGuige = function (guigeId) {
    //获取默认选中的规格
    var guige_1 = '';
    var guige_2 = '';
    var guigeIds = '';
    var guigeList = $('.servicereserve-content').find('.guigeList');
    for (var index = 0; index < guigeList.length; index++) {
      if (index == 0) {
        var sepcDiv = guigeList[index];
        var select = $(sepcDiv).find('.guigeSelect')[0];
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].selected == true) {
            guige_1 = select.options[i].value;
            break;
          }
        }
      }
      if (index == 1) {
        var sepcDiv = guigeList[index];
        var select = $(sepcDiv).find('.guigeSelect')[0];
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].selected == true) {
            guige_2 = select.options[i].value;
            break;
          }
        }
      }

    }

    if (guige_1 != '' && guige_2 != '') {
      guigeIds = guige_1 + ',' + guige_2;
    }
    if (guige_1 == '' && guige_2 != '') {
      guigeIds = guige_2;
    }
    if (guige_1 != '' && guige_2 == '') {
      guigeIds = guige_1;
    }


    //根据当前的服务站以及规格获取库存以及价格
    guanjiaService.getPriceAndInventory({
      'guige_id': guigeIds,
      'goods_id': sessionStorage.reserveGoodsId,
      'service_station': sessionStorage.selectedServiceStationId
    }).success(function (res) {

      if (res.code == 0) {
        $scope.salePrice = res.data.sale_price;
        $scope.oldPrice = res.data.old_price;
        $scope.serviceReserve.inventory = res.data.inventory;

        //从缓存加载数据
        loadDatafromCache();
        //从缓存中获取到用户之前选择的商品的数量后计算商品的总价
        $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
      } else {
        commonService.showErrorMessage(res.data);
      }
    }).error(function (data, status, header, config) {
      commonService.showErrorMessage('系统错误');
    });
  };


  //选择服务站
  $scope.selectStation = function () {

    //在前往选择我的小区之前将当前的页面信息保存在reserveCacheService中
    saveInfoToCache();

    localStorage.goodsId = sessionStorage.reserveGoodsId;
    localStorage.selectStationFrom = 2;
    $state.go('service-selectStation', {operate: 2, obj: {}});
  };

  //跳转到我的小区选择页
  $scope.goMyCommunity = function () {
    if ($cookies.get('ticket') == null) {
      $state.go('member-personal-login');
    } else {

      saveInfoToCache();

      localStorage.toMyCommunitySelect = 6;
      $state.go('service-mycommunityselect', {
        operate: 6,
        obj: {}
      });
    }

  };

  //前往小区列表选择小区
  $scope.selecteCommunity = function () {
    if ($cookies.get('ticket') == null) {
      $state.go('member-personal-login');
    } else {
      //在前往选择我的小区之前将当前的页面信息保存在reserveCacheService中
      saveInfoToCache();

      var reserveCache = reserveCacheService.getter();
      $state.go('member-user-selectcommunity', {
        operate: 3,
        obj: {}
      });
    }
  }


  //返回
  $scope.back = function () {

    if (stackIndex == 0) {
      //回到服务列表
      localStorage.skip = 'purchase';
      var bussinessId = sessionStorage.businessId;
      var bussinessName = sessionStorage.businessName;
      $state.go("guanjia-familyservicelist", {
        "businessId": bussinessId,
        "bussinessName": bussinessName
      })
    }
    if (stackIndex == 1) {
      //回到服务详情
      $state.go("guanjia-familyservicedetail", {"goodsId": sessionStorage.reserveGoodsId})
    }

    localStorage.removeItem('backReserve');
    sessionStorage.removeItem('reserveGoodsId');
    sessionStorage.removeItem('selectedServiceStationId');
    localStorage.removeItem('reserveFrom');
    reserveCacheService.clean();

  };

  var guige1 = '', guige2 = '';
  var guigeIds = '';

  function getParams() {
    if ($cookies.get('ticket') == null) {
      localStorage.toPurchase = 5
      $state.go('member-personal-login');
      sessionStorage.loginLocation = $location.path();
    } else if (!(/^[1-9]*$/.test($scope.count))) {
      commonService.showNoticeMessage('数量只能是正整数！');
    } else if ($scope.userName == null || $scope.userName == "") {
      commonService.showNoticeMessage('请填写联系人！');
    } else if ($scope.telephone == null || $scope.telephone == "") {
      commonService.showNoticeMessage('请填写联系电话！');
    } else if ($scope.communityId == null || $scope.communityId == "" || $scope.communityId == undefined) {
      commonService.showNoticeMessage('请选择小区！');
    } else {
      // var guiges = $('.servicereserve-service-specification').find('.servicereserve-service-specification-row');
      // if (guiges.length > 0) {
      //   $.each(guiges, function (index, elem) {
      //     var key = $(elem).children('.servicereserve-service-specification-name').html();
      //     var select = $(elem).find('.servicereserve-dropdown');
      //     var value = $(select).find('option:selected').text();
      //     if (index == 0) {
      //       guige1 = key + value;
      //     } else {
      //       guige2 = key + value;
      //     }
      //   });
      //
      // }

      var selectList = $('.servicereserve-content').find('.guigeSelect');
      var guige1Id = '';
      var guige2Id = '';
      selectList.each(function (index, select) {
        if (index == 0) {
          guige1 = $(select).attr('name') + '：' + $(select).find("option:selected").text();
          guige1Id = $(select).find("option:selected").val();
        } else {
          guige2 = $(select).attr('name') + '：' + $(select).find("option:selected").text();
          guige2Id = $(select).find("option:selected").val();
        }
      });

      if (guige1Id != '' && guige2Id != '') {
        guigeIds = guige1Id + ',' + guige2Id;
      }
      if (guige1Id == '' && guige2Id != '') {
        guigeIds = guige2Id;
      }
      if (guige1Id != '' && guige2Id == '') {
        guigeIds = guige1Id;
      }

      return true;
    }
    return false;
  }

  //放入购物车
  $scope.insertCart = function () {
    if (!userService.validateMobile(localStorage.mobile)) {
      commonService.showWarnMessage(userService.validateMobile(localStorage.mobile).msg);
      return;
    }
    var isContinue = getParams();
    if (isContinue) {
      var params = {
        ticket: $cookies.get('ticket'),
        mobile: localStorage.mobile,
        goods_id: $scope.serviceReserve.goods_id,
        count: $scope.count,
        guige: guigeIds,
        guige_1: guige1,
        guige_2: guige2,
        remark: $scope.remarks,
        contact_name: $scope.userName,
        contact_phone: $scope.telephone,
        community_id: $scope.communityId,
        number: $scope.floor,
        delivery_id: $scope.currentSelectedDeliveryId,
        service_station_id: $scope.stationId
      };
      if (localStorage.target != null && localStorage.target == 'article' || localStorage.target == 'ad') {
        params.target = localStorage.target;
        localStorage.removeItem('target');
      }
      guanjiaService.addcart(params).success(function (response) {
        if (response.code == '0') {
          $scope.cartCount++;
          commonService.showSuccessMessage('添加成功，快去购物车查看吧~');
        } else if (response.code == '-8') {
          //登录前存储当前页面的信息
          saveInfoToCache();

          //前往登陆
          localStorage.reserveFrom = 5;
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          commonService.showWarnMessage(response.data);
        }
      });
    }
  };

  $scope.goBackOther = function () {
    if (localStorage.goodsDetailFrom == '%reserveList%') {
      localStorage.skip = 'orderList';
      $state.go('member-user-reserve');
    } else if (localStorage.goodsDetailFrom == '%cartList%') {
      var temp = localStorage.skip.split(':')[0];
      $state.go('member-user-cart', {from: temp});
    } else if (localStorage.goodsDetailFrom == '%orderDetail%') {
      localStorage.skip = 'detailList';
      $state.go('member-user-orderdetail');
    } else {
      $state.go('guanjia-familyservicelist', {
        businessId: sessionStorage.businessId,
        businessName: sessionStorage.businessName
      });
    }
  };

  $scope.goCart = function () {
    localStorage.skip = '预约';
    $state.go('member-user-cart',{from:0});
  };

  //直接预约
  $scope.straightReserve = function () {
    var isContinue = getParams();
    if (isContinue) {
      var goodsReserve = [];
      var obj = {
        ticket: $cookies.get('ticket'),
        mobile: localStorage.mobile,
        goods_id: $scope.serviceReserve.goods_id,
        count: $scope.count,
        guige: guigeIds,
        guige_1: guige1,
        guige_2: guige2,
        remark: $scope.remarks,
        contact_name: $scope.userName,
        contact_phone: $scope.telephone,
        community_id: $scope.communityId,
        number: $scope.floor,
        delivery_id: $scope.currentSelectedDeliveryId,
        service_station_id: $scope.stationId,
        target: ''
      };
      if (localStorage.target != null && localStorage.target == 'article' || localStorage.target == 'ad') {
        obj.target = localStorage.target;
        localStorage.removeItem('target');
      }
      goodsReserve.push(obj);

      var params = {"mobile": localStorage.mobile, "goods": goodsReserve};
      params = {json: JSON.stringify(params)};
      userService.postRequestWithUrlAndParams("buy.action", params).success(function (response) {
        if (response.code == '0') {
          commonService.showSuccessMessage('预约成功！');
          $timeout(function () {
            if (localStorage.goodsDetailFrom == '%reserveList%') {
              localStorage.skip = 'orderList';
              $state.go('member-user-reserve');
            } else if (localStorage.goodsDetailFrom == '%cartList%') {
              var temp = localStorage.skip.split(':')[0];
              $state.go('member-user-cart', {from: temp});
            } else if (localStorage.goodsDetailFrom == '%orderDetail%') {
              localStorage.skip = 'detailList';
              $state.go('member-user-orderdetail');
            } else {
              $state.go('guanjia-familyservicelist', {
                businessId: sessionStorage.businessId,
                businessName: sessionStorage.businessName
              });
            }
          }, 500);
        } else if (response.code == '-4') {
          commonService.showWarnMessage('铛铛，商家休息了！');
        } else if (response.code == '-8') {
          //登录前存储当前页面的信息
          saveInfoToCache();

          //前往登陆
          localStorage.reserveFrom = 5;
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          commonService.showWarnMessage(response.data);
        }
      });
    }
  }

}]);
//服务列表
guanjiaModuleController.controller('familyservicelistCtrl', ['$scope', '$stateParams', 'guanjiaService', '$q', 'userService', 'commonService', '$state', '$cookies', function ($scope, $stateParams, guanjiaService, $q, userService, commonService, $state, $cookies) {

  //from 判断从哪个页面跳转到此页
  // %fuli% 商家福利  %tegong%  特供服务
  if (null != $stateParams.target) localStorage.target = $stateParams.target;
  $scope.from = $cookies.get('from');
  $scope.businessId = $cookies.get('businessId');
  $scope.city_fuwu_id = $cookies.get("city_fuwu_id");
  if ($scope.from == null || $scope.businessId == null && $scope.city_fuwu_id == null)
    $state.go('guanjia-comservice'); //如果cookie被清

  //商家详情
  guanjiaService.businessDetail({business_id: $scope.businessId}).success(function (data) {
    $scope.business = data.data;
  });

  //返回到商家列表
  $scope.backtosupport = function () {
    $state.go('guanjia-familyservicelist');
  };

  //获取公告数据
  function getNotice() {
    var defer = $q.defer();
    guanjiaService.listNotice({
      type: $scope.businessId ? 'business' : 'city',
      city_id: sessionStorage.gpscityId,
      business_id: $scope.businessId
    }).success(function (data) {
      $scope.marqueeContent = data.data;
      defer.resolve($scope.marqueeContent);
      $.getScript('scripts/common/plugins/marquee.js', function () {
        createMarquee();
      });
    });
    return defer.promise;
  }

  $scope.noticePromise = getNotice();

  //获取商品分类
  function getCategory() {
    $scope.serviceCount = [];//存放商品分类index
    var defer = $q.defer();
    guanjiaService.listCategory({
      business_id: $scope.businessId,
      city_fuwu_id: $scope.city_fuwu_id
    }).success(function (response) {
      if (response.code == '0') {
        $scope.categoryLis = response.data;
        if (response.data.length == 0) {
          $('.familyservicelist-segmentcontrol').css('display', 'none');
          localStorage.showType = '0';
        }
        $scope.categoryLis.unshift({category_id: '1', name: '全部'});
        //从广告跳转过来
        if ($scope.from == '%guanggao%') {
          var tabItem = $cookies.get('name');
          if (tabItem == '全部') {
            localStorage.cateId = '';
          } else {
            var tabIndex;
            $.each($scope.categoryLis, function (index, info) {
              if (info.name == tabItem) {
                localStorage.cateId = info.category_id;
                localStorage.showType = index;
                tabIndex = index;
                return false;
              }
            });
            if (tabIndex == undefined) {
              commonService.showWarnMessage('家庭服务列表页的' + tabItem + '选项卡不存在！');
              $state.go(localStorage.adRoute);
              $cookies.put('from', 'toBack');
            }

          }
        }

        defer.resolve($scope.categoryLis);
        $.each($scope.categoryLis, function (index, info) {
          $scope.serviceCount.push(index);
        });

        //默认加载商品列表
        $scope.index = localStorage.showType;
        //全部的index为：0; 判断index的值，如果不是0，那么修改参数的category_id
        if ($scope.index != '0') {
          $scope.serviceListParams.category_id = localStorage.cateId;
        }
        $scope.serviceListParams.sort = $scope.selected;
        $scope.serviceList = [];
        $scope.serviceListFun($scope.serviceListParams);
      } else {
        console.log('获取商品分类失败!');
      }
    });
    return defer.promise;
  }

  $scope.promised = getCategory();

  //点击分类按钮
  $scope.showCtagoryContent = function (index, cateId) {
    $('.search-input').val('');
    if (cateId == '1') {
      //$scope.index = $scope.categoryLis.length;
      $scope.serviceListParams.category_id = null;
    } else {
      $scope.serviceListParams.category_id = cateId;
      //记录分类的ID
      localStorage.cateId = cateId;
    }
    $scope.index = index;
    $scope.serviceListParams.sort = $scope.selected;
    $scope.serviceList = [];
    $scope.serviceListFun($scope.serviceListParams);
  };

  $scope.serviceListParams = {
    business_id: $scope.businessId,
    city_fuwu_id: $scope.city_fuwu_id,
    pageno: '1', //页码
    pagesize: '10', //页数
    direction: 'up',
    url: 'listGoods.action',
    category_id: null,
    sort: null,
    key: ''
  };
  $scope.serviceList = [];
  var isOver = false;//false:标志数据未加载完成
  $scope.errMsg = '';
  $scope.serviceListFun = function (params) {
    var defer = $q.defer();
    userService.postRequestWithPageNo(params).success(function (response) {

      var tempList = response.data.goods;
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
        $scope.serviceList = tempList;
      } else {
        $scope.serviceList = $scope.serviceList.concat(tempList);
      }
    });
    return defer.promise;
  };

  //选择下拉列表选项
  $scope.changeSort = function () {
    $scope.serviceListParams.sort = $scope.selected;
    $scope.serviceListParams.direction = 'down';
    $scope.serviceList = [];
    $scope.serviceListFun($scope.serviceListParams);
  };


  /*****************关键字搜索**************************************/
  var val = '';
  $scope.searchServiceList = function () {
    val = $('.search-input').val();
    $scope.serviceList = [];
    $scope.serviceListParams.key = val;
    $scope.serviceListParams.pageno = '1';
    $scope.serviceListFun($scope.serviceListParams);
  };
  //失去焦点事件
  $scope.inputBlur = function () {
    $scope.serviceListParams.key = $('.search-input').val();
  };


  //返回按钮
  $scope.goBack = function () {
    val = $('.search-input').val();
    if (val != '') {
      $('.search-input').val('');
      $scope.searchServiceList();
    }
    else if ($scope.from == '%guanggao%') {
      $state.go(localStorage.adRoute);
      $cookies.put('from', 'toBack');
    } else if ($scope.from == '%couponsSeller%') { //返回到优惠券商家页
      $state.go('member-user-mycoupons');
      localStorage.skip = 'couponsSeller';
      localStorage.showType = '1';
    } else {
      $state.go('guanjia-familyservice');
      $cookies.remove("businessId");
      $cookies.remove('city_fuwu_id');
    }
  };

  //点击服务，进入服务详情页
  $scope.goServiceDetail = function (goodsId, index) {
    localStorage.showType = index;
    localStorage.removeItem('skip');
    localStorage.goodsDetailFrom = "%goodsList%";
    $state.go('guanjia-familyservicedetail', {
      goodsId: goodsId
    });
  };

  //点击预约，进入服务预约页
  $scope.goReserve = function (goodsId, index) {
    //记录选中选项卡的index值
    localStorage.showType = index;
    //清空skip的值
    localStorage.removeItem('skip');
    //$event.stopPropagation();
    sessionStorage.reserveGoodsId = goodsId;
    sessionStorage.stackIndex = 0;
    $state.go('guanjia-servicereserve', {
      operate: 0,
      obj: {
        goodsId: goodsId
      }
    });
    //本地保存goodsId,以便服务预约中选择小区后跳转回预约页用
    localStorage.reserveGoodId = goodsId;
  }


  //跳转到卖家详情
  $scope.jumpSellerdetail = function () {
    if (null != $scope.businessId) {
      $state.go('guanjia-sellerdetail', {businessId: $scope.businessId});
    }
  };

}]);

//公共服务
guanjiaModuleController.controller('publicserviceCtrl', ['$scope', '$location', 'guanjiaService', '$sce', 'userService', '$q', 'commonService', '$state', '$cookies', '$rootScope', '$stateParams', function ($scope, $location, guanjiaService, $sce, userService, $q, commonService, $state, $cookies, $stateParams) {
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
    $scope.from = $location.$$search.label ? $location.$$search.label : $cookies.get('from');
    /*
     * 条件：后台没有添加政府URL
     * 结果：选项卡中不显示政务平台选项
     * */
    //获取政府URL
    $scope.getGovermentInfo = function () {
      var defer = $q.defer();
      guanjiaService.listGovernmentInfo({
        city_id: sessionStorage.gpscityId
      }).success(function (response) {
        if (response.code == '0') {
          var resultUrl;
          if (response.data.param) {
            resultUrl = response.data.url + '?' + response.data.param;
          } else {
            resultUrl = response.data.url;
          }
          var governmentUrl = $sce.trustAsResourceUrl(resultUrl);
          if (governmentUrl) {
            $scope.menuList = [
              {type: '0', name: '政务平台'},
              {type: '1', name: '社区街道'},
              {type: '2', name: '物业管理'},
            ];
            if ($scope.from != '%guanggao%') {
              $scope.defaultType = $scope.from == 'wuye' ? '2' : '0'; //默认加载政务平台列表
              if ($scope.defaultType == '2') {
                $scope.wuyeLis = [];
                $scope.wuyeFun($scope.wuyeParams);
                $scope.isShowLis = true;
                $scope.tabIndex = 2;
              } else $scope.governmentUrl = governmentUrl;
            }
          } else if (!governmentUrl) {
            $scope.menuList = [
              {type: '1', name: '社区街道'},
              {type: '2', name: '物业管理'},
            ];
            if ($scope.from != '%guanggao%') {
              $scope.defaultType = $scope.from == 'wuye' ? '2' : '1'; //默认加载社区街道平台
              if ($scope.defaultType == '2') {
                $scope.wuyeLis = [];
                $scope.wuyeFun($scope.wuyeParams);
                $scope.isShowLis = true;
                $scope.tabIndex = 2;
              } else {
                $scope.shequLis = [];
                $scope.shequFun($scope.shequParams);
                $scope.isShowLis = true;
                $scope.tabIndex = 1;
              }
            }
          }
          defer.resolve($scope.menuList);
          //从广告跳转过来
          if ($scope.from == '%guanggao%') {
            var tabItem = $cookies.get('name');
            $scope.tabIndex;
            $.each($scope.menuList, function (index, info) {
              if (info.name == tabItem) {
                $scope.tabIndex = index;
                $scope.defaultType = info.type;
              }
            });
            if ($scope.tabIndex == undefined) {
              commonService.showWarnMessage('公共服务的' + tabItem + '选项卡不存在！');
              $state.go(localStorage.adRoute);
              $cookies.put('from', 'toBack');
              return;
            }
            if ($scope.defaultType == '1') {
              $scope.isShowLis = true;
              $scope.shequLis = [];
              $scope.shequFun($scope.shequParams);
            } else if ($scope.defaultType == '2') {
              $scope.isShowLis = true;
              $scope.wuyeLis = [];
              $scope.wuyeFun($scope.wuyeParams);
            }
          }
        } else if (response.code == '-8') {
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          commonService.showWarnMessage(response.data);
        }
      });
      return defer.promise;
    };

    $scope.promise = $scope.getGovermentInfo();

    //社区街道
    $scope.shequParams = {
      city_id: sessionStorage.gpscityId,
      pageno: '1', //页码
      pagesize: '10', //页数
      url: 'listShequ.action',
      direction: 'up',
      key: ''
    };
    $scope.shequLis = [];
    var isOver = false; //false:标志数据未加载完成
    $scope.sheInfo = '';
    $scope.shequFun = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        switch (response.code) {
          case '0':
            if (response.data.length == 0 && params.pageno == '1') {
              $scope.sheInfo = '没有相关数据';
            } else {
              var tempList = response.data;
              if (tempList.length < params.pagesize) {
                isOver = true;//true:标志数据加载完成
                defer.resolve(isOver);
              } else {
                isOver = false;
                defer.resolve(isOver);
              }


              if (params.direction == 'down') {
                $scope.shequLis = response.data;
              } else {
                $scope.shequLis = $scope.shequLis.concat(tempList);
              }
            }
            break;
        }
      });
      return defer.promise;
    };


    //物业管理
    $scope.wuyeParams = {
      "city_id": sessionStorage.gpscityId,
      'pageno': '1', //页码
      'pagesize': '10', //页数
      "url": 'listWuye.action',
      'direction': 'up',
      'key': ''
    };
    $scope.wuyeLis = [];
    var isWY = false; //false:标志数据未加载完成
    $scope.wuyeInfo = '';
    $scope.wuyeFun = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        switch (response.code) {
          case '0':
            if (response.data.length == 0 && params.pageno == '1') {
              $scope.wuyeInfo = '没有相关数据';
            } else {
              var tempList = response.data;
              if (tempList.length < params.pagesize) {
                isOver = true;//true:标志数据加载完成
                defer.resolve(isOver);
              } else {
                isOver = false;
                defer.resolve(isOver);
              }

              if (params.direction == 'down') {
                $scope.wuyeLis = response.data;
              } else {
                $scope.wuyeLis = $scope.wuyeLis.concat(tempList);
              }
            }
            break;
        }
      });
      return defer.promise;
    };

    //切换选项卡
    $scope.showActive = function (type, $event) {
      $scope.defaultType = type;
      if (type == '0') {
        $('#government').attr('src', $scope.governmentUrl);
      }
      else if (type == '1') {
        $scope.isShowLis = true;
        $scope.shequLis = [];
        $scope.shequFun($scope.shequParams);
      } else if (type == '2') {
        $scope.isShowLis = true;
        $scope.wuyeLis = [];
        $scope.wuyeFun($scope.wuyeParams);
      }
      $('.publicservice-segmentcontrol a').css({
        'border-bottom': '3px solid transparent',
        'color': '#666'
      });
      $($event.target).css({
        'border-bottom': '3px solid #7DB343',
        'color': '#7DB343'
      });
    };

    //关键字搜索
    $scope.searchbyKey = function () {
      var key = $('.searchPublic').find('input').val();
      if ($scope.defaultType == '1') {
        $scope.sheInfo = '';
        $scope.shequParams.url = 'listShequ.action';
        $scope.shequParams.key = key;
        $scope.shequParams.pageno = '1';
        $scope.shequLis = [];
        $scope.shequFun($scope.shequParams);
      }
      if ($scope.defaultType == '2') {
        $scope.wuyeInfo = '';
        $scope.wuyeParams.url = 'listWuye.action';
        $scope.wuyeParams.key = key;
        $scope.wuyeParams.pageno = '1';
        $scope.wuyeLis = [];
        $scope.wuyeFun($scope.wuyeParams);
      }
    };

    //返回
    $scope.toBack = function () {
      if ($scope.from == '%guanggao%') {
        $state.go(localStorage.adRoute);
        $cookies.put('from', 'toBack');
      } else {
        $state.go("guanjia-comservice");
      }
    }
  })


}]);

//政务平台 暂无处理
guanjiaModuleController.controller('microServiceCtrl', ['$scope', function ($scope) {

}]);

//家庭金融
guanjiaModuleController.controller('familyaccountCtrl', ['$scope', 'guanjiaService', '$state', 'commonService', '$cookies', 'userService', '$q', '$rootScope', function ($scope, guanjiaService, $state, commonService, $cookies, userService, $q, $rootScope) {
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
    $scope.accountParams = {
      city_id: sessionStorage.gpscityId,
      pageno: '1', //页码
      pagesize: '20', //页数
      url: 'listBusinessByFuwuType.action',
      fuwu_type: '家庭金融',
      direction: 'up'
    };

    //************************************ 控制器内容 ************************************

    //返回首页
    $scope.backtocomservice = function () {
      val = $('.search-input').val();
      if (val != '') {
        $('.search-input').val('');
        $scope.searchAccount();
        return;
      }
      if (localStorage.jinrongFrom == '%comservice%' || !localStorage.jinrongFrom) {
        $state.go('guanjia-comservice');
      }
      if (localStorage.jinrongFrom == '%guanggao%') {
        $state.go(localStorage.adRoute);
      }
      localStorage.removeItem('goodsDetailFrom');
    };
    //轮播图
    $scope.imgShow = true;
    var params = {
      "type": "system,city",
      "city_id": sessionStorage.gpscityId,
      "label": "金融"
    };
    guanjiaService.listad(params).success(function (response) {

      switch (response.code) {
        case '0':
          if (response.data) {
            $scope.slides = response.data;

            $scope.myInterval = parseInt($rootScope.shuffling) * 1000;

            if ($scope.slides.length > 0) {
              //轮播图请求到数据1秒后显示
              setTimeout(function () {
                $scope.imgShow = false;
              }, 1000);
            }
          }

          break;
        case '-1':
          console.log("社区服务轮播图参数为空");
          break;
      }
    }).error(function (data, status, header, config) {

    });

    //获取公告数据
    guanjiaService.listNotice({
      type: "system,city",
      city_id: sessionStorage.gpscityId,
      "label": "金融"
    }).success(function (data) {
      $scope.marqueeContent = data.data;
      $.getScript('scripts/common/plugins/marquee.js', function () {
        createMarquee();
      });
    });
    //金融机构列表
    $scope.familyaccountList = [];
    var isOver = false; //false:标志数据未加载完成
    $scope.errMsg = '';
    $scope.familyAccount = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        switch (response.code) {
          case '0':
            var tempList = response.data.list;
            $scope.allBusiness = response.data;
            $scope.city_fuwu_id = $scope.allBusiness.city_fuwuId;
            if (tempList.length == 0 && params.pageno == '1') {
              $scope.errMsg = '没有相关数据';
              return;
            }
            $scope.errMsg = '';
            if (tempList.length < params.pagesize) {
              isOver = true;//true:标志数据加载完成
              defer.resolve(isOver);
            } else {
              isOver = false;
              defer.resolve(isOver);
            }

            if (params.direction == 'down') {//下拉刷新
              $scope.familyaccountList = response.data.list;
            } else {//上拉加载
              $scope.familyaccountList = $scope.familyaccountList.concat(tempList);
            }

            break;
          case '-1':
            //参数为空
            $scope.errMsg = '请求有误';
            break;
          case '-2':
            //金融服务不存在
            $scope.errMsg = '没有相关数据';
            break;
        }
      });
      return defer.promise;
    };

    $scope.familyAccount($scope.accountParams);

    /***********************关键字搜索*****************************************/
    var val = '';
    $scope.searchAccount = function () {
      $scope.familyaccountList = [];
      val = $('.search-input').val();
      $scope.accountParams.key = val;
      $scope.accountParams.pageno = 1;
      $scope.familyAccount($scope.accountParams);
    };

    //金融列表
    $scope.jumpaccountlist = function (businessId) {
      localStorage.removeItem('skip');
      //默认选项卡为全部
      localStorage.showType = '0';
      $state.go('guanjia-familyaccountlist');
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      //存放商家ID
      if (null == businessId) {
        $cookies.put('city_fuwu_id', $scope.city_fuwu_id, {'expires': expireDate.toUTCString()});
      } else {
        $cookies.remove('city_fuwu_id');
      }
      $cookies.put('from', '%jinrong%', {'expires': expireDate.toUTCString()});
      $cookies.put('businessId', businessId, {'expires': expireDate.toUTCString()});
    };


    //点击广告前往广告详情
    $scope.adToDetail = function (index) {
      var adObject = $scope.slides[index];
      userService.adLinkTo("guanjia-familyaccount", adObject);
      if (adObject.category == '动态') commonService.addAdLog(adObject);
    }


  })


}]);
//金融商品列表
guanjiaModuleController.controller('familyaccountlistCtrl', ['$scope', 'guanjiaService', '$stateParams', 'userService', 'commonService', '$state', '$cookies', '$q', function ($scope, guanjiaService, $stateParams, userService, commonService, $state, $cookies, $q) {

  $scope.accountbusinessId = $cookies.get('businessId');
  $scope.city_fuwu_id = $cookies.get('city_fuwu_id');
  $scope.from = $cookies.get('from');
  if ($scope.accountbusinessId == null && $scope.city_fuwu_id == null) {
    $state.go('guanjia-comservice');
  }

  //返回金融机构列表
  $scope.backtofamilyaccount = function () {
    val = $('.search-input').val();
    if (val != '') {
      $('.search-input').val('');
      $scope.searchAccount();
      return;
    }
    if ($cookies.get('from') == '%guanggao%') {
      $state.go(localStorage.adRoute);
      $cookies.put('from', 'toBack');
    }
    if ($cookies.get('from') == '%jinrong%') {
      $state.go('guanjia-familyaccount');
    }
  };

  //商家详情
  if (null != $scope.accountbusinessId) {
    guanjiaService.businessDetail(
        {
          business_id: $scope.accountbusinessId
        }).success(function (data) {
      $scope.business = data.data;
    });
  }
  //调用分类接口
  $scope.getCategory = function () {
    var defer = $q.defer();
    guanjiaService.listCategory({
      business_id: $scope.accountbusinessId,
      city_fuwu_id: $scope.city_fuwu_id
    }).success(function (data) {
      if (data.code == '0') {
        $scope.category = data.data;
        if ($scope.category.length == 0) {
          $('.dynamic-tabs').css('display', 'none');
          localStorage.showType = '0';
        }
        $scope.category.unshift({category_id: '1', name: '全部'});
        //从广告跳转过来
        if ($scope.from == '%guanggao%') {
          var tabItem = $cookies.get('name');
          if (tabItem == '全部') {
            localStorage.cateId = '';
          } else {
            var tabIndex;
            $.each($scope.category, function (index, info) {
              if (info.name == tabItem) {
                localStorage.cateId = info.category_id;
                localStorage.showType = index;
                tabIndex = index;
                return false;
              }
            });
            if (tabIndex == undefined) {
              commonService.showWarnMessage('家庭金融列表页的' + tabItem + '选项卡不存在！');
              $state.go(localStorage.adRoute);
              $cookies.put('from', 'toBack');
            }

          }
        }

        defer.resolve($scope.category);
        //获取分类的index，保存在数组$scope.category_count中
        $scope.category_count = [];
        $.each($scope.category, function (index, info) {
          $scope.category_count.push(index);
        });

        //默认获取数据
        $scope.index = localStorage.showType;
        //全部的index为0
        if ($scope.index != '0') {
          $scope.params.category_id = localStorage.cateId;
        }
        $scope.accountList = [];
        $scope.accountListFun($scope.params);
      } else {
        console.log('获取分类信息有误！');
      }
    });
    return defer.promise;
  };

  $scope.accountlistPromise = $scope.getCategory();

  $scope.params = {
    business_id: $scope.accountbusinessId,
    city_fuwu_id: $scope.city_fuwu_id,
    pageno: '1', //页码
    pagesize: '15', //页数
    url: 'listGoods.action',
    category_id: null,
    sort: 'up_date',
    direction: 'up',
    key: ''
  };

  $scope.accountList = [];
  var isOver = false;//false:标志数据未加载完成
  $scope.errMsg = '';
  $scope.accountListFun = function (params) {
    var defer = $q.defer();
    userService.postRequestWithPageNo(params).success(function (response) {
      if (response.code == '0') {
        var tempList = response.data.goods;
        if (tempList.length == 0 & params.pageno == '1') {
          $scope.errMsg = '没有相关数据';
          return;
        }
        $scope.errMsg = '';
        if (tempList.length < params.pagesize) {
          isOver = true;//true:标志数据加载完成
          defer.resolve(isOver);
        } else {
          isOver = false;
          defer.resolve(isOver);
        }
        if (params.direction == 'down') {
          $scope.accountList = response.data.goods;
        } else {
          $scope.accountList = $scope.accountList.concat(tempList);
        }
      } else {
        console.log('familyaccoutlistCtrl 获取信息失败！');
      }
    });
    return defer.promise;
  };

  //获取公告数据
  function getNotice() {
    var defer = $q.defer();
    guanjiaService.listNotice({
      type: $scope.accountbusinessId ? 'business' : 'city',
      business_id: $scope.accountbusinessId,
      city_fuwu_id: $scope.city_fuwu_id
    }).success(function (data) {
      defer.resolve(data.data);
      $scope.marqueeContent = data.data;

      $.getScript('scripts/common/plugins/marquee.js', function () {
        createMarquee();
      });
    });
    return defer.promise;
  }

  $scope.noticePromise = getNotice();

  //分类按钮的点击效果
  $scope.changecate = function (id, index) {
    $('.search-input').val('');
    if (id == '1') {
      $scope.params.category_id = null;
    } else {
      $scope.params.category_id = id;
      localStorage.cateId = id;
    }
    $scope.index = index;
    $scope.accountList = [];
    $scope.params.pageno = 1;
    $scope.accountListFun($scope.params);
  };

  /**********************关键字搜索************************************/
  var val = '';
  $scope.searchAccount = function () {
    $scope.accountList = [];
    val = $('.search-input').val();
    $scope.params.pageno = 1;
    $scope.params.key = val;
    $scope.accountListFun($scope.params);
  };
  //失去焦点时，获取key的值
  $scope.accountlistBlur = function () {
    $scope.params.key = $('.search-input').val();
  };

  //进入商品详情
  $scope.jumpaccountDetail = function (id, name, index) {
    localStorage.removeItem('skip');
    //记录选项卡的状态下标
    localStorage.showType = index;
    localStorage.jinrongDetailFrom = "%jinrongList%"
    $state.go('guanjia-familyaccountdetail', {
      goodsId: id
    });
  };

  //跳转到卖家详情
  $scope.jumpSellerdetail = function () {
    if (null != $scope.accountbusinessId) {
      $state.go('guanjia-sellerdetail', {businessId: $scope.accountbusinessId});
    }
  };
}]);

//金融商品详情
guanjiaModuleController.controller('familyaccountdetailCtrl', ['$scope', 'guanjiaService', '$interval', '$stateParams', '$state', 'commonService', '$cookies', '$sce', '$q', function ($scope, guanjiaService, $interval, $stateParams, $state, commonService, $cookies, $sce, $q) {
  //$scope.accountgoodsId = $stateParams.goodsId;
  //$scope.accountgoodsName = $stateParams.goodsName;
  //$scope.accountbusinessId=$stateParams.businessId;
  //$scope.accountbusinessName=$stateParams.businessName;

  //返回商品列表
  //$scope.backtofamilyaccountlist=function(){
  //  $state.go('guanjia-familyaccountlist',{
  //    businessName:$scope.accountbusinessName,
  //    businessId: $scope.accountbusinessId
  //  })
  //};
  $scope.back = function () {
    if (localStorage.jinrongDetailFrom == '%guanggao%') {
      $state.go(localStorage.adRoute);

    }
    if (localStorage.jinrongDetailFrom == '%jinrongList%') {
      localStorage.skip = 'detail';
      $state.go('guanjia-familyaccountlist');
    }

  };

  $scope.goodsId = $stateParams.goodsId;
  $scope.imgShow = false; //false:标志轮播图未加载出来

  //调用商品详情接口
  guanjiaService.goodsDetail({'goods_id': $scope.goodsId}).success(function (data) {
    switch (data.code) {
      case '0':
        if (data.data != '') {
          $scope.accountgoodsList = data.data;
          if ($scope.accountgoodsList.description) {
            $scope.evaluateContent = true;
            $scope.accountDetaildescription = $sce.trustAsHtml(data.data.description);
          } else {
            $scope.evaluateContent = false;
            $scope.errMsg = '无相关数据！';
          }
          //商品开卖倒计时
          $scope.countdown = $scope.accountgoodsList.now_date;

          if ($scope.countdown != '') {
            var time = Math.floor($scope.countdown / 1000);
            var showTime = $interval(function () {
              var timeDiffer = $scope.countdown;
              if (time < 1) {
                $interval.cancel(showTime);
              } else {
                // 天
                var int_day = Math.floor(timeDiffer / 86400000);
                timeDiffer -= int_day * 86400000;
                // 时
                var int_hour = Math.floor(timeDiffer / 3600000);
                timeDiffer -= int_hour * 3600000;
                // 分
                var int_minute = Math.floor(timeDiffer / 60000);
                timeDiffer -= int_minute * 60000;
                // 秒
                var int_second = Math.floor(timeDiffer / 1000);
                // 时分秒为单数时、前面加零
                if (int_day < 10) {
                  int_day = "0" + int_day;
                }
                if (int_hour < 10) {
                  int_hour = "0" + int_hour;
                }
                if (int_minute < 10) {
                  int_minute = "0" + int_minute;
                }
                if (int_second < 10) {
                  int_second = "0" + int_second;
                }

                $scope.showTimeHtml = '开卖倒计时：' + int_day + '天' + int_hour + '时' + int_minute + '分' + int_second + '秒';
                $scope.countdown -= 1000;
                time--;
              }
            }, 1000);
          } else {
            $('.count_down').css({
              'height': '2px'
            })
          }

          $scope.slides = $scope.accountgoodsList.goods_images;
          //if ($scope.slides != '') {
          //  //轮播图请求到数据1秒后显示
          //  setTimeout(function () {
          //    $scope.imgShow = false;
          //  }, 1000);
          //}

          if ($scope.slides.length > 0) {
            $scope.imgShow = true;//true:标志轮播图数据加载完成
          }

        } else {
          commonService.showWarnMessage("暂无商品信息！");
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
}]);

//广告
guanjiaModuleController.controller('addetailCtrl', ['$scope', 'guanjiaService', '$sce', '$stateParams', '$state', '$cookies', function ($scope, guanjiaService, $sce, $stateParams, $state, $cookies) {

  $scope.adUrl = 'www.baidu.com';

}]);
