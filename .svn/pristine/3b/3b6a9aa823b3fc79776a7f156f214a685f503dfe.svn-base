var welfareController = angular.module('welfareController', []);

welfareController.controller('welfareCtrl', ['$scope', 'guanjiaService', 'userService', '$q', '$state', 'commonService', '$timeout', '$rootScope', '$cookies', function ($scope, guanjiaService, userService, $q, $state, commonService, $timeout, $rootScope, $cookies) {

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
    /*********************************** 自定义函数 ***************************************/
      //默认商家列表函数参数
      //参数
    $scope.params = {
      city_id: sessionStorage.gpscityId,
      pageno: '1', //页码
      pagesize: '15', //页数
      url: 'listBusinessByFuwuType.action',
      fuwu_type: '商家福利',
      direction: 'up',
      key: ''
    };
    $scope.errMsg = '';
    var isOver = false; //false:标志数据未加载完成
    $scope.businessFun = function (params) {
      //console.log(params);
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        //console.log(response);
        switch (response.code) {
          case '0':
            $scope.businessInfo = response.data;
            var tempList = response.data.list;
            $scope.city_fuwu_id = $scope.businessInfo.city_fuwuId;
            if (tempList.length == 0 && params.pageno == '1') {
              $scope.errMsg = '没有相关数据';//无数据
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
              $scope.business = tempList;
            } else {
              $scope.business = $scope.business.concat(tempList);
            }

            //判断是否为新品
            $scope.isnew = function (value) {
              if (value == 'Y')
                return true;
              else
                return false;
            };
            //判断是否为爆品
            $scope.ishot = function (value) {
              if (value == 'Y')
                return true;
              else
                return false;
            };

            break;
          case '-1':
            //commonService.showErrorMessage("参数为空！");
            $scope.errMsg = '请求数据失败';
            break;
          case '-2':
            //commonService.showErrorMessage("服务不存在！");
            $scope.errMsg = '没有相关数据';
            break;
        }

      });
      return defer.promise;
    };

    //默认的红包列表函数
    //参数
    $scope.redPacketparams = {
      city_id: sessionStorage.gpscityId,
      pageno: '1', //页码
      pagesize: '15', //页数
      status: "0",
      url: 'listUserCoupons.action',
      type: '商家福利',
      direction: 'up',
      key: ''
    };
    $scope.errMsg = '';
    $scope.redPackageFun = function (params) {
      var defer = $q.defer();
      userService.postRequestWithPageNo(params).success(function (response) {
        switch (response.code) {
          case '0':
            var tempList = response.data;
            if (tempList.length == 0 && params.pageno == '1') {
              /*判断请求的第一页无数据时，显示暂无数据*/
              $scope.errMsg = '没有相关数据'; //是否给无数据提示
              return;
            } else {
              $scope.errMsg = '';
              if (tempList.length < params.pagesize) {
                isOver = true;//true:标志数据加载完成
                defer.resolve(isOver);
              } else {
                isOver = false;
                defer.resolve(isOver);
              }

              if (params.direction == 'down') {//下拉刷新
                $scope.redPacketList = response.data;
              } else {//上拉加载
                $scope.redPacketList = $scope.redPacketList.concat(tempList);
              }
            }
            break;
          case '-1':
            $scope.errMsg = '参数为空';
            break;
          case '-8':
            $state.go('member-personal-login', {from: '4'});
            break;
        }
      }).error(function (data, status, header, config) {
      });
      return defer.promise;
    };

    //获取广告和公告数据
    //获取轮播图数据
    function getCarouselData(){
      var defer = $q.defer();
      $scope.imgShow = false;
      guanjiaService.listad({
        type: 'system,city',
        city_id: sessionStorage.gpscityId,
        label: '福利'
      }).success(function (data) {
        $scope.myInterval = parseInt($rootScope.shuffling) * 1000;
        $scope.slides = data.data;
        defer.resolve(data.data);
        if ($scope.slides.length > 0) {
          //轮播图请求到数据1秒后显示
          setTimeout(function () {
            $scope.imgShow = true;
          }, 1000);
        }

      });
      return defer.promise;
    }
    //获取公告数据
    function getNotice(){
      var defer = $q.defer();
      guanjiaService.listNotice({
        type: 'system,city',
        city_id: sessionStorage.gpscityId,
        label: '福利'
        //business_id: localStorage.businessId
      }).success(function (data) {
        $scope.marqueeContent = data.data;
        defer.resolve(data.data);
        $.getScript('scripts/common/plugins/marquee.js', function () {
          createMarquee();
        });
      });
      return defer.promise;
    }

    getCarouselData().then(function(data){
      var carouselH = 0;
      var marqueeH = 0;
      if(data.length > 0){
        carouselH = $rootScope.width * 9 / 16;
      }
      getNotice().then(function(data){
        if(data.length > 0){
          marqueeH = 25;
        }
        var contentH = $(window).height() - $('.navigationbar').outerHeight();
        var tabH = $('.text-center').outerHeight();
        var bottomH = $('.navbar-fixed-bottom').outerHeight();
        contentH = contentH - carouselH - marqueeH - tabH - bottomH;
        localStorage.welfareH = contentH;
        /*$('.contentArea').css({
          'overflow' : 'scroll',
          'height' : contentH + 'px'
        });*/
      });
    });

    //搜索后红包列表函数

    /************************************** end ******************************************/

    /************************************ 初始化  ****************************************/
    //$scope.city_name = sessionStorage.gpscityName;
    //判断用户是否登录，未登录默认商城类，已登录默认红包类
    //sessionStorage.welfareType 1 红包类  2 商城类
    if ($cookies.get('ticket')) { //已登录
      if (sessionStorage.welfareType == 2) { //商城类
        $('.sellerWelfare .shop').addClass('cartHead');
        $scope.shopColor = 'btn-success';
        $scope.shopHtml = true;
        $scope.redPacketColor = 'BG-grey';
        $scope.redPackageHtml = false;

        //商城列表
        $scope.businessFun($scope.params);

      } else { //红包类
        $('.sellerWelfare .redPacket').addClass('cartHead');
        $scope.redPackageHtml = true;
        $scope.shopHtml = false;
        //红包列表
        $scope.redPackageFun($scope.redPacketparams);
      }

    } else { //未登录，只能商城卡头
      $('.sellerWelfare .shop').addClass('cartHead');
      $scope.shopColor = 'btn-success';
      $scope.shopHtml = true;
      $scope.redPacketColor = 'BG-grey';
      $scope.redPackageHtml = false;

      //商城列表
      $scope.businessFun($scope.params);
    }

    var isBusiness = false;//false:标志数据未加载完成
    $scope.business = [];
    $scope.redPacketList = [];
    var isOver = false; //false:标志数据未加载完成
    //sessionStorage.welfareType = 0;

    /************************************** end ******************************************/

    /*********************************** 页面事件监听 *************************************/
      //当切换到商城卡时
    $scope.shop = function (type) {
      sessionStorage.welfareType = type;
      //卡头样式
      $('.sellerWelfare .shop').addClass('cartHead');
      $('.sellerWelfare .redPacket').removeClass('cartHead');
      $scope.shopHtml = true;
      $scope.redPackageHtml = false;

      //$scope.getAdNoticeData();//公告和广告

      //商城列表
      $scope.business = [];
      $scope.businessFun($scope.params);
    };

    //当切换到红包卡时
    $scope.redPacket = function (type) {
      sessionStorage.welfareType = type;
      //卡头样式
      $('.sellerWelfare .redPacket').addClass('cartHead');
      $('.sellerWelfare .shop').removeClass('cartHead');
      $scope.redPackageHtml = true;
      $scope.shopHtml = false;

      //$scope.getAdNoticeData();//公告和广告

      //红包列表
      $scope.redPacketList = [];
      $scope.redPackageFun($scope.redPacketparams);
    };

    /******************关键字搜索***************************/
    var val = '';
    //sessionStorage.welfareType = 1; //默认选项卡是红包； 2:商城
    $scope.searchByKey = function () {
      val = $('.search-input').val();
      if (sessionStorage.welfareType == 1) { //红包
        $scope.redPacketList = [];
        $scope.redPacketparams.key = val;
        $scope.redPacketparams.pageno = '1';
        $scope.redPackageFun($scope.redPacketparams);
      } else { //商城
        $scope.business = [];
        $scope.params.key = val;
        $scope.params.pageno = '1';
        $scope.businessFun($scope.params);
      }
    };

    //失去焦点，获取key的值
    $scope.welfareBlur = function () {
      if (sessionStorage.welfareType == 1) {
        $scope.redPacketparams.key = $('.search-input').val();
      } else {
        $scope.params.key = $('.search-input').val();
      }
    };

    //点击商家，跳转到商家列表
    $scope.jumpgoodslist = function (businessId) {
      localStorage.showType = 0;//默认加载全部
      $state.go('guanjia-goodslist');
      var expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 30);
      if (null == businessId) {
        $cookies.put('city_fuwu_id', $scope.city_fuwu_id, {'expires': expireDate.toUTCString()});
      } else {
        $cookies.remove('city_fuwu_id');
      }
      $cookies.put('businessId', businessId, {'expires': expireDate.toUTCString()});  //存放商家ID
      $cookies.put('from', '%fuli%', {'expires': expireDate.toUTCString()}); //存放特供标识符
      localStorage.removeItem('welfareH');
    };

    //返回到首页
    $scope.backComservice = function () {
      localStorage.goodsId = "8a28d7d855968fa9015599cc31e7000a";
      $state.go('guanjia-support');
      localStorage.removeItem('welfareH');
    };

    //跳转到优惠券详情页
    $scope.goDetail = function (couponsId, fuwu_type) {
      $state.go('member-user-coupondetail', {
        couponsId: couponsId,
        fuwu_type: fuwu_type
      });
      $cookies.put('from', '%fuli%'); //存放商家福利页标识符
      localStorage.removeItem('welfareH');
    };


    $scope.adToDetail = function (index) {
      var adObject = $scope.slides[index];
      userService.adLinkTo("welfare-seller", adObject);
      localStorage.removeItem('welfareH');
      //添加广告日志
      if (adObject.category == '动态') commonService.addAdLog(adObject);
    }


    /************************************** end ******************************************/
  })

}]);
