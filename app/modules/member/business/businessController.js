'use strict';

var businessModuleController = angular.module('businessModuleController', ['chart.js']);

//我发货的商品页
businessModuleController.controller(
    'deliveryCtrl', ['$scope', 'userService', 'commonService', '$timeout', '$q', '$state',
      '$location', '$filter', function ($scope, userService, commonService, $timeout, $q, $state, $location, $filter) {
        $scope.params = {
          url: 'listPeisong.action',
          pageno: '1', //页码
          pagesize: '10', //页数
          direction: 'up',
          date: '',
          fuwu_id: '',
          business_id: '',
          sort: 'station_category',
          key: ''
        };
        $scope.deliveryList = []; //明细
        $scope.stationMap = {}; //服务站分类
        $scope.goodsMap = {}; //商品分类
        $scope.fuwu = []; //服务
        $scope.faDate = ''; //需送日
        $scope.business = []; //商家
        var isOver = false; //false:标志数据未加载完成
        $scope.errMsg = '';
        var count = 0;
        $scope.fuwuLen = false;
        $scope.businessLen = false;
        $scope.serviceStationSort = true; // 服务站分类：true -----> 默认显示服务站分类数据
        $scope.goodSort = false; //商品分类：true
        $scope.deliveryDetail = false; //明细：true
        var isExcute = true;//判断是否更新商家内容
        $scope.deliveryFun = function (params) {
          var defer = $q.defer();
          userService.postRequestWithPageNo(params).success(function (response) {
            switch (response.code) {
              case '0':
                /*******获取需送日、类型、商家信息****/
                if (count == 0) {
                  //服务
                  $scope.fuwu = response.data.fuwu;
                  if ($scope.fuwu.length == 0) {
                    $scope.fuwuLen = true;
                  } else {
                    $scope.fuwuLen = false;
                    $scope.fuwuSelected = $scope.fuwu[0].id;
                  }
                  var sendDate = response.data.date;
                  $scope.faDate = $filter('date')(sendDate, 'yyyy-MM-dd').substring(0, 10);
                }
                //发送日
                count++;
                //商家
                if (isExcute) {
                  $scope.business = [];
                  $scope.business = response.data.business;
                  if ($scope.business.length == 0) {
                    $scope.businessLen = true;
                    $scope.busSelected = '1';
                  } else {
                    $scope.businessLen = false;
                    setTimeout(function () {
                      var options = $('.business option');
                      for (var index = 0; index < options.length; index++) {
                        var option = options[index];
                        var value = option.value;
                        var text = option.text
                        if (text == '' || value.indexOf('?') != -1) {
                          option.remove();
                        } else {
                          option.selected = true;
                          break;
                        }
                      }
                    }, 0);
                    //$scope.busSelected = $scope.business[0].id;
                  }
                }
                if (!params.date) {
                  var sendDate = response.data.date;
                  $scope.faDate = $filter('date')(sendDate, 'yyyy-MM-dd').substring(0, 10);
                }

                /*******************获取服务站分类数据*************************/
                if ($scope.serviceStationSort) {
                  if (response.data.stationMap.totalCount != 0) {
                    $scope.stationMap = response.data.stationMap;
                    $scope.errMsg = '';
                  } else {
                    $scope.errMsg = '没有相关数据';
                  }
                  return;
                }

                /*******************获取商品分类数据*************************/
                if ($scope.goodSort) {
                  if (response.data.goodsMap.totalCount != 0) {
                    $scope.goodsMap = response.data.goodsMap;
                    $scope.errMsg = '';
                  } else {
                    $scope.errMsg = '没有相关数据';
                  }
                  return;
                }
                /**************获取明细数据***********************/
                if ($scope.deliveryDetail) {
                  var tempList = response.data.order;
                  if (tempList.length == 0 && params.pageno == '1') {
                    $scope.errMsg = '没有相关数据';//商家列表无数据
                    return;
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
                    $scope.deliveryList = response.data.order;
                  } else {
                    $scope.deliveryList = $scope.deliveryList.concat(tempList);
                  }
                }
                break;
              case '-8':
                $state.go('member-personal-login');
                sessionStorage.loginLocation = $location.path();
                break;
              default:
                commonService.showWarnMessage(response.data);
            }
          });
          return defer.promise;
        };
        $scope.businessPromise = $scope.deliveryFun($scope.params);

        /************************按选择条件筛选列表，通用方法**********************************/
        $scope.listByConditions = function (type) {
          $scope.deliveryList = [];
          $scope.params.fuwu_id = $('.category option:selected').val();
          $scope.params.business_id = $('.business option:selected').val();
          $scope.params.sort = $('.sort option:selected').val();
          if (type == 'date') {
            var sendDate = $('#faDate').val();
            if (sendDate) {
              sendDate = sendDate.split('-');
              $scope.params.date = sendDate[0] + '年' + sendDate[1] + '月' + sendDate[2] + '日';
            }
          }
          if (type == 'fuwu') {
            isExcute = true;
          } else {
            isExcute = false;
          }

          if ($scope.params.sort == 'station_category') { //显示服务站分类
            $scope.serviceStationSort = true;
            $scope.goodSort = false;
            $scope.deliveryDetail = false;
          } else if ($scope.params.sort == 'category_sort') {  //显示商品分类
            $scope.goodSort = true;
            $scope.serviceStationSort = false;
            $scope.deliveryDetail = false;
          } else { //显示明细
            $scope.deliveryDetail = true;
            $scope.goodSort = false;
            $scope.serviceStationSort = false;
          }
          $scope.params.pageno = '1';
          $scope.businessPromise = $scope.deliveryFun($scope.params);
        };

        /*******************关键字搜索************************/
        var val = '';
        $scope.searchDel = function () {
          $scope.deliveryList = [];
          val = $('.search-input').val();
          $scope.params.key = $('.search-input').val();
          $scope.params.pageno = '1';
          $scope.deliveryFun($scope.params);
        };
        //失去焦点事件，获取key的值
        $scope.deliveryBlur = function () {
          $scope.params.key = $('.search-input').val();
        };

        //返回
        $scope.back = function () {
          val = $('.search-input').val();
          if (val != '') {
            $('.search-input').val('');
            $scope.searchDel();
            return;
          }
          $state.go('member-personal-usercenter');
        };

        //修改发量
        $scope.jian = function ($event) {
          var val = parseInt($($event.target).next().val());
          if (val > 0) {
            --val;
          }
          $($event.target).next().val(val);
          $scope.faCount = val;
        };
        $scope.faChange = function ($event, orderItem, dingCount, faCount) {
          $('#sendCount').css('display', 'block');
          $scope.orderItem = orderItem;
          $scope.event = $event.target;
          $scope.dingCount = parseInt(dingCount);
          $scope.faCount = faCount;
        };
        $scope.jia = function ($event) {
          var val = parseInt($($event.target).prev().val());
          if (val < parseInt($scope.dingCount)) {
            val++;
          }
          $($event.target).prev().val(val);
          $scope.faCount = val;
        };
        $scope.faSure = function () {
          //发量为正整数且大于1且小于等于订量数
          if ($scope.faCount <= $scope.dingCount && (/^[1-9]*$/.test($scope.faCount))) {
            userService.postRequestWithUrlAndParams('peisongCount.action', {
              orderItem_id: $scope.orderItem,
              count: $scope.faCount
            }).success(function (response) {
              if (response.code == '0') {
                commonService.showSuccessMessage('发量修改成功！');
              } else if (response.code == '-8') {
                $state.go('member-personal-login');
                sessionStorage.loginLocation = $location.path();
              } else {
                commonService.showWarnMessage(response.data);
              }
              $($scope.event).prev().html($scope.faCount);
            });
          } else {
            commonService.showWarnMessage('请输入小于订量的正整数！');
          }
        };

        //发货
        var orderItemFa = [];
        //var sureFa = [];
        $scope.sendGoods = function () {
          orderItemFa = [];
          if ($scope.deliveryList.length == 0) {
            commonService.showWarnMessage('没有相关数据不能执行该操作');
            return;
          }
          //var goodStutas = [];
          var isContinue = false;
          var isStutas = false;
          $.each($('.list-group-item'), function (index, domEl) {
            if ($(domEl).find('.sure').hasClass('checked')) {
              var good_status = $(domEl).find('.good_status');
              if (good_status.html() == '已完成') {
                isStutas = true;
                return;
              }
              var order_item = $(domEl).find('.orderItem').html();
              orderItemFa.push(order_item);
              //goodStutas.push(good_status);
              //sureFa.push($(domEl).find('.sure'));
              isContinue = true;
            }
          });
          if (isStutas) {
            commonService.showWarnMessage('已发货的不能执行发货操作');
            return;
          }
          if (isContinue) {
            $('#sendSure').css('display', 'block');
          } else {
            commonService.showWarnMessage('请选择商品');
          }
        };

        $scope.sureSendGoods = function () {
          userService.postRequestWithUrlAndParams('peisongStatus.action', {
            orderItem_id: orderItemFa.join()
          }).success(function (response) {
            if (response.code == '0') {
              $scope.deliveryList = [];
              $scope.deliveryFun($scope.params);
              commonService.showSuccessMessage('发货成功！');
              /*$.each(goodStutas,function(index,domEl){
               $(domEl).html('已发货');
               $(domEl).parents('.list-group-item').find('.fa_edit_btn').css({
               'display' : 'none'
               });
               });*/
              /*$.each(sureFa,function(index,domEl){
               $(domEl).removeClass('checked');
               $(domEl).attr('src', 'images/sure-icon.png');
               });*/

            } else if (response.code == '-8') {
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
            } else {
              commonService.showWarnMessage(response.data);
            }
          });
        };

        $scope.sendAll = function () {
          if ($scope.deliveryList.length == 0) {
            commonService.showWarnMessage('没有相关数据不能执行该操作');
            return;
          }
          $('#sendAll').css('display', 'block');
        };

        $scope.sureSendAll = function () {
          var businessId = $('#busSelected').val();
          if (typeof businessId != 'undefined') {
            // console.log($scope.faDate);此方法受干扰。
            var sendDate = $('#faDate').val();
            if (sendDate) {
              sendDate = sendDate.split('-');
              sendDate = sendDate[0] + '年' + sendDate[1] + '月' + sendDate[2] + '日';
            }
            userService.sendAllGoods({
              date: sendDate,
              business_id: businessId
            }).then(function (resp) {
              switch (resp.code) {
                case '0':
                  commonService.showSuccessMessage('发货成功！');
                  $scope.params.direction = 'down';
                  $scope.deliveryFun($scope.params);
                  break;
                case '-1':
                  console.log('参数为空！');
                  break;
                case '-2':
                  console.log('参数错误！');
                  break;
                case '-3':
                  commonService.showWarnMessage('抱歉，您还不是定时服务商家');
                  break;
              }
            }, function (error) {
              commonService.showErrorMessage('系统发生错误，请联系管理员');
            });
          }
        };

        //取消发货
        var orderItemCancel = [];
        //var sureCancel = [];
        $scope.cancelSend = function () {
          orderItemCancel = [];
          if ($scope.deliveryList.length == 0) {
            commonService.showWarnMessage('没有相关数据不能执行该操作');
            return;
          }
          //var goodStutas = [];
          var isContinue = false;
          var isStutas = false;
          var isPai_date = false;
          var order_no;

          $.each($('.list-group-item'), function (index, domEl) {
            if ($(domEl).find('.sure').hasClass('checked')) {
              var good_status = $(domEl).find('.good_status');

              if (good_status.html() == '待发货') {
                isStutas = true;
                return;
              }
              var pai_date = $(domEl).find('.pai_date').html();
              if (pai_date) {
                order_no = $(domEl).find('.order_no').html();
                isPai_date = true;
                return;
              }

              var order_item = $(domEl).find('.orderItem').html();
              orderItemCancel.push(order_item);
              //goodStutas.push(good_status);
              //sureCancel.push($(domEl).find('.sure'));
              isContinue = true;
            }
          });
          if (isStutas) {
            commonService.showWarnMessage('待发货的不能执行取消发货操作');
            return;
          }

          if (isPai_date) {
            commonService.showWarnMessage(order_no + ',该商品已派发，不能执行取消发货操作!');
            return;
          }

          if (isContinue) {
            $('#cancelFaModal').css('display', 'block')
          } else {
            commonService.showWarnMessage('请选择商品');
          }
        };

        $scope.cancelSendGoods = function () {
          userService.postRequestWithUrlAndParams('cancelPeisong.action', {
            orderItem_id: orderItemCancel.join()
          }).success(function (response) {
            console.log(response);
            if (response.code == '0') {
              $scope.deliveryList = [];
              $scope.deliveryFun($scope.params);
              commonService.showSuccessMessage('取消发货成功！');
            } else if (response.code == '-8') {
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
            } else {
              commonService.showWarnMessage(response.data);
            }
          });
        };

      }]);

//我派发的商品页
businessModuleController.controller(
    'distributeCtrl', ['$scope', '$rootScope', 'guanjiaService', 'commonService', 'userService', '$timeout', '$q', '$state',
      '$filter', '$cookies',
      function ($scope, $rootScope, guanjiaService, commonService, userService, $timeout, $q, $state, $filter, $cookies) {

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
            }
        );

        $scope.params = {
          mobile: localStorage.mobile,
          city_id: sessionStorage.gpscityId,
          pageno: '1', //页码
          pagesize: '10', //页数
          url: 'listPaisong.action',
          direction: 'up',
          sort: 'mobile_sort',
          date: '',
          service_station_id: '',
          fuwu_id: '',
          key: ''
        };
        var isOver = false; //false:标志数据未加载完成
        $scope.distributeList = [];
        $scope.paiDate = '';//需派日
        $scope.serviceStation = [];//服务站
        $scope.fuwu = [];//服务
        var paiCount = 0;
        $scope.errMsg = '';
        $scope.isFuwu = false;
        $scope.isBusiness = false;
        $scope.isExcute = true; //判断是否执行服务站内容更新
        $scope.distributeFun = function (params) {
          var defer = $q.defer();
          userService.postRequestWithPageNo(params).success(function (response) {
            switch (response.code) {
              case '0':
                /**********获取需送日、服务站、服务、排序*************/
                if (paiCount == 0) {
                  $scope.fuwu = response.data.fuwu;
                  $scope.orderNum = response.data.order_number;
                  if ($scope.fuwu.length == 0) {
                    $scope.isFuwu = true;
                  } else {
                    $scope.isFuwu = false;
                    $scope.paifa_fuwu = response.data.fuwu[0].id;
                    $scope.goodType = response.data.fuwu[0].xingqi;  //goodType: true: 定时商品，false: 非定时商品
                    //document.getElementById('faDate').disabled = !$scope.goodType;
                    //第一个是定时服务，需要后台返回的日期
                    if ($scope.goodType) {
                      paiDate = response.data.date;
                      $scope.paiDate = $filter('date')(paiDate, 'yyyy-MM-dd').substring(0, 10);
                    }
                  }
                }
                paiCount++;
                if ($scope.isExcute) {
                  $scope.serviceStation = response.data.service_station;
                  if ($scope.serviceStation.length == 0) {
                    $scope.isBusiness = true;
                    $scope.paifa_bus = '1';
                  } else {
                    $scope.isBusiness = false;
                    //$scope.paifa_bus = $scope.serviceStation[0].id;
                    setTimeout(function () {
                      var options = $('.serviceStation option');
                      for (var index = 0; index < options.length; index++) {
                        var option = options[index];
                        var value = option.value;
                        var text = option.text
                        if (text == '' || value.indexOf('?') != -1) {
                          option.remove();
                        } else {
                          option.selected = true;
                          break;
                        }
                      }
                    }, 0);
                  }
                }

                if (!params.date) {
                  var paiDate = response.data.date;
                  $scope.paiDate = $filter('date')(paiDate, 'yyyy-MM-dd').substring(0, 10);
                }
                /*请求数据*/
                var tempList = response.data.order;
                if (tempList.length == 0 && params.pageno == '1') {
                  $scope.errMsg = '没有相关数据';//商家列表无数据
                  return;
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
                  $scope.distributeList = response.data.order;
                } else {
                  $scope.distributeList = $scope.distributeList.concat(tempList);
                }
                break;
              case '-8':
                $state.go('member-personal-login');
                sessionStorage.loginLocation = $location.path();
                break;
              default:
                commonService.showWarnMessage(response.data);
            }
          });
          return defer.promise;
        };
        $scope.distributeFun($scope.params);

        /********************按选择条件，筛选派发列表*********************************/
        $scope.listByCdt = function (type) {
          $scope.selectTypeVal = type;
          $scope.distributeList = [];
          $scope.params.fuwu_id = $(".fw option:selected").val();
          /*
           * //判断服务:定时 || 非定时
           * 定时服务：日期控件显示需派日
           * 非定时服务：默认日期为空，显示未派发商品，选择日期，显示当天的商品
           * */
          var optionClass = $('.fw option:selected').attr('class');
          if (type == 'fuwu' && optionClass.indexOf('true') != -1) { //定时商品
            $scope.goodType = true;  // true：定时商品
            $scope.params.date = '';
          } else if (type == 'fuwu' && optionClass.indexOf('false') != -1) {//非定时商品
            $scope.goodType = false; //false:非定时商品
            $scope.params.date = '';
          }
          if (type == 'fuwu') {
            $scope.isExcute = true;
          } else {
            $scope.isExcute = false;
          }

          if (type == 'date') {
            var sendDate = $('.sendDate').val();
            if (sendDate) {
              sendDate = sendDate.split('-');
              $scope.params.date = sendDate[0] + '年' + sendDate[1] + '月' + sendDate[2] + '日';
            }
          }

          //document.getElementById('faDate').disabled = !$scope.goodType;
          $scope.params.service_station_id = $('.serviceStation option:selected').val();
          $scope.params.sort = $('.sort option:selected').val();
          $scope.params.pageno = '1';
          $scope.distributeFun($scope.params);
        };

        /*******************关键字搜索************************/
        $scope.searchDistr = function () {
          $scope.distributeList = [];
          $scope.params.pageno = '1';
          $scope.params.key = $('.search-input').val();
          $scope.distributeFun($scope.params);
        };

        $scope.selectByStatus = function (status) {
          $scope.params.status = status;
          $scope.params.pageno = '1';
          $scope.params.key = $('.search-input').val();
          $scope.distributeList = [];
          $scope.params.direction = "down";
          $scope.distributeFun($scope.params);
        };

        //失去焦点事件，获取key的值
        $scope.distributeBlur = function () {
          $scope.params.key = $('.search-input').val();
        };

        //返回
        $scope.back = function () {
          var val = $('.search-input').val();
          if (val != '') {
            $('.search-input').val('');
            $scope.searchDistr();
            return;
          }
          $state.go('member-personal-usercenter');
        };

        //修改收量
        $scope.shouChange = function ($event, orderItem, faCount) {
          $('#receive').css('display', 'block');
          var shouCount = parseInt($($event.target).prev().html());
          $('.shouCount').val(shouCount);
          $scope.event = $event.target;
          $scope.orderItem = orderItem;
          //$scope.goodId = goodId;
          $scope.shouCount = parseInt(shouCount);
          $scope.faCount = parseInt(faCount);
        };
        //点击确认
        $scope.shouSure = function () {
          //修改的收量必须为正整数且小于等于发量
          console.log($scope.orderItem);
          if (parseInt($('.shouCount').val()) <= parseInt($scope.faCount) && (/^[0-9]*$/.test($('.shouCount').val()))) {
            userService.postRequestWithUrlAndParams('paisongCount.action', {
              orderItem_id: $scope.orderItem,
              shou_count: $('.shouCount').val()
            }).success(function (response) {
              if (response.code == '0') {
                commonService.showSuccessMessage('收量修改成功！');
              } else if (response.code == '-8') {
                $state.go('member-personal-login');
                sessionStorage.loginLocation = $location.path();
              } else {
                commonService.showErrorMessage(response.data);
              }
              $($scope.event).prev().html($('.shouCount').val());
            });
          } else {
            commonService.showWarnMessage('请输入不大于发量的正整数！');
          }

        };

        //修改派量
        var isPaiSong = true; //未派发
        var isTimeGood = false; // true：定时商品
        $scope.change_pai = function ($event, orderItem, shoutC, guige1, guige2) {
          $('#receivePai').css('display', 'block');
          var paiCount = parseInt($($event.target).prev().html());
          $scope.paiCount = parseInt(paiCount);
          $scope.shouCount = parseInt(shoutC);
          $scope.event = $event.target;
          $scope.orderItem = orderItem;
          //根据是否有派发时，来判断是否勾选
          var paiDateElem = $($event.target).parents('.distribute-data').find('.paiDate');
          if (paiDateElem.html() == 'undefined' || paiDateElem.html() == undefined) { //未派发
            isPaiSong = true;
          } else { //已派发
            isPaiSong = false;
          }

          if (guige1.indexOf('星期') != -1) {
            isTimeGood = true; //定时商品
          } else if (guige2.indexOf('星期') != -1) {
            isTimeGood = true; //定时商品
          } else {
            isTimeGood = false; //非定时商品
          }

        };
        //-
        $scope.minus = function ($event) {
          var val = parseInt($($event.target).next().val());
          if (val > 0) {
            --val;
          }
          $($event.target).next().val(val);
        };
        //+
        $scope.plus = function ($event, type) {
          var val = parseInt($($event.target).prev().val());
          if (val < parseInt($scope.shouCount) && type == '派量') {
            val++;
          } else if (val < parseInt($scope.faCount) && type == '收量') {
            val++;
          }
          $($event.target).prev().val(val);
        };
        //确认修改派量
        $scope.sure_paiC = function () {
          if (parseInt($('.paiC').val()) <= parseInt($scope.shouCount) && (/^[0-9]*$/.test($('.paiC').val()))) {
            userService.postRequestWithUrlAndParams('paisongCount.action', {
              orderItem_id: $scope.orderItem,
              pai_count: $('.paiC').val()
            }).success(function (response) {
              if (response.code == '0') {
                commonService.showSuccessMessage('派量修改成功！');
                $($scope.event).prev().html($('.paiC').val());

                var liParents = $($scope.event).parents('.distribute-data');
                var sureElem = $(liParents).find('.sure');
                if (isPaiSong && $('.paiC').val() != '0') { //未派发 且派量改为非0，自动勾选
                  $(sureElem).addClass('checked');
                  $(sureElem).attr('src', 'images/checked.jpg');
                } else if ($('.paiC').val() == '0') {
                  var dateElem = $(liParents).find('.paiDate').remove();
                  $(sureElem).removeClass('checked');
                  $(sureElem).attr('src', 'images/sure-icon.png');
                  //修改定时商品的状态
                  if (isTimeGood) {
                    var paiStatusElem = $(liParents).find('.pai_status');
                    $(paiStatusElem).html('已发货');
                  }
                }
              } else if (response.code == '-8') {
                $state.go('member-personal-login');
                sessionStorage.loginLocation = $location.path();
              } else {
                commonService.showErrorMessage(response.data);
              }
            });

          } else {
            commonService.showErrorMessage('请输入不大于收量的正整数！');
          }
        };

        //派发
        var orderItems = [];
        var paiDate = [];
        var pai_num;
        var isStatus = false;
        $scope.paiFa = function () {
          orderItems = [];
          paiDate = [];
          if ($scope.distributeList.length == 0) {
            commonService.showSuccessMessage('没有相关数据，不能进行派发操作!');
            return;
          }

          $.each($('.line-paifa'), function (index, domEl) {
            if ($(domEl).find('.sure').hasClass('checked')) {
              var status = $(domEl).find('.pai_status').html();
              if (status != '已发货') {
                isStatus = true;
                return;
              }

              var order_item = $(domEl).find('.orderItem').html();
              var pai_date = $(domEl).find('.paiDate').html();
              pai_num = $(domEl).find('.paL').html();
              orderItems.push(order_item);

              if (pai_num == '0') {
                return;
              }
            }
          });
          if (orderItems.length > 0) {
            if (pai_num == '0') {
              commonService.showSuccessMessage('派量为0,不能进行派发!');
              return;
            }
            $('#receiveSure').css('display', 'block');
          } else {
            if (isStatus) {
              isStatus = false;
              commonService.showWarnMessage('派发限于已发货！');
            } else {
              commonService.showWarnMessage('请选择商品');
            }
          }

        };

        $scope.sure_paiFa = function () {
          userService.postRequestWithUrlAndParams('paisongStatus.action', {
            orderItem_id: orderItems.join()
          }).success(function (response) {
            if (response.code == '0') {
              commonService.showSuccessMessage('派发成功！');
            } else if (response.code == '-8') {
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
            } else {
              commonService.showSuccessMessage(response.data);
            }
            $scope.distributeList = [];
            $scope.params.pageno = '1';
            $scope.distributeFun($scope.params);
          });
        };

      }]
);

//我粉丝的验证码页
businessModuleController.controller(
    'fans_codeCtrl',
    function ($scope, $stateParams, userService, $state, $interval, $rootScope, commonService) {
      //获取验证码信息
      $scope.codeParams = {
        'key': ''
      };
      $scope.fansCodeList = [];
      $scope.errMsg = '';
      function getCodes(params) {
        userService.listCode(params).success(function (response) {
          switch (response.code) {
            case '0':
              if (response.data.length > 0) {
                $scope.errMsg = '';
                $scope.fansCodeList = response.data;
              } else {
                $scope.errMsg = '没有相关数据';
              }
              break;
            case '-1':
              commonService.showWarnMessage("请输入手机号码！");
              break;
          }
        });
      };

      getCodes($scope.codeParams);
      /*************************关键字搜索****************/
      $scope.searchCode = function () {
        $scope.fansCodeList = [];
        $scope.codeParams.key = $('.search-input').val();
        getCodes($scope.codeParams);
      };
      //失去焦点时，获取key值
      $scope.codeBlur = function () {
        $scope.codeParams.key = $('.search-input').val();
      };

      $scope.back = function () {
        history.back();
      }
    }
);

//业务量统计页
businessModuleController.config(function (ChartJsProvider) {
  ChartJsProvider.setOptions(
      {colours: ['#803690', '#00ADF9', '#196CFB', '#46BFBD', '#FDB45C', '#04BE02', '#4D5360', '#601626', '#DEB504']}
  );
});
businessModuleController.controller(
    'portfolioCtrl',
    function ($scope, $cookies, $rootScope, $stateParams, userService, guanjiaService, $state) {
      $scope.colours = ['#803690', '#00ADF9', '#196CFB', '#46BFBD', '#FDB45C', '#04BE02', '#4D5360', '#601626', '#DEB504'];
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
        //----------------------------------------------------函数----------------------------------------------------------//
        function filterDate(data) {
          var result = [];
          $.each(data, function (index, info) {
            var tmp = info.substr(info.length - 2);
            result.push(tmp);
          });
          return result;
        }

        function getTotal(params) {
          var totalPromise = userService.getTotal(params);
          totalPromise.then(function (response) {
            //设置下拉城市。
            $scope.allCityData = response.data.cityList;
            if (typeof $scope.selectedCity == 'undefined') {
              $scope.selectedCity = $scope.allCityData[0].city_id;
            }
            //统计图数据
            $scope.labels = filterDate(response.data.labels);
            $scope.series = response.data.series;
            $scope.datas = response.data.data;
            $scope.reverseColours = $scope.colours.slice(0, $scope.series.length).reverse();
            $scope.reverseLabels = $.makeArray($scope.labels).reverse();
            $scope.reverseSeries = $.makeArray($scope.series).reverse();
            $scope.reverseDatas = $.makeArray($scope.datas).reverse();
          });
        }

        //----------------------------------------------------初始化--------------------------------------------------------//
        $scope.params = {
          type: '',
          city_id: $scope.usercityId
        };
        $scope.params.type = 'order';//fans:吸粉统计 order:销售统计 ad:广告统计 telphone:电话统计
        $scope.params.orderType = '';
        //请求统计接口
        getTotal($scope.params);
        //------------------------------------------------------页面事件监听-------------------------------------------------//

        $scope.changeSeletedCity = function () {
          $scope.params.city_id = $scope.selectedCity;
          getTotal($scope.params);
        };

        $scope.changeOrderTopTab = function (type) {
          $scope.datas = null;
          if ($scope.params.type == 'order') $scope.params.orderType = type;
          else $scope.params.orderTopType = type;
          getTotal($scope.params);
        };

        $scope.changeTabTotal = function (type) {
          $scope.datas = null;
          delete $scope.params.orderType;
          delete $scope.params.orderTopType;
          if (type == 'orderTop') $scope.params.orderTopType = 'business';
          else if (type == 'order') $scope.params.orderType = '';
          $scope.params.type = type;
          getTotal($scope.params);
        };

        //返回
        $scope.back = function () {
          $state.go('member-personal-usercenter');
        };

      });
    }
);
