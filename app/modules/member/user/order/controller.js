'use strict';

var orderModuleController = angular.module('orderModuleController', []);

//我的订单
orderModuleController.controller(
    'myOrderCtrl', ['$scope', 'userService', '$state', 'commonService', '$timeout', '$interval', '$rootScope', '$q', '$stateParams', '$cookies', '$location', 'payCacheService', function ($scope, userService, $state, commonService, $timeout, $interval, $rootScope, $q, $stateParams, $cookies, $location, payCacheService) {
      //记录进入我的订单页的页面
      var toSkipHere = localStorage.skip;

      $cookies.remove('businessId');
      /*****************订单列表**********************/
      $scope.orderParams = {
        status: '0',
        'pageno': '1', //页码
        'pagesize': '10', //页数
        "url": 'listOrder.action',
        'direction': 'up',
        'key': '',
        'type': '特供,福利'
      };
      $scope.errMsg = '';
      $scope.orderList = [];
      var isAll = false;//false:标志数据未加载完成
      $scope.getOrders = function (params) {
        var defer = $q.defer();
        userService.postRequestWithPageNo(params).success(function (response) {
          switch (response.code) {
            case '0':

              if (params.pageno == 1) {
                $scope.orderList = [];
              }

              var tempList = response.data;

              /*
               * add by yincong 19/09/2016
               * line 33~71
               * 用作保存勾选状态
               */

              //console.log(tempList);
              //var orderTable = [];
              //if (tempList.length > 0){

              //var localOrderArrayStr = localStorage.selectedUnpaidOrder;
              //if(localOrderArrayStr == undefined){ //还没有往本地表中添加过商品
              //  //此时所有的订单以及商品都是非勾选状态
              //  for(var index = 0 ; index < tempList.length; index++){
              //    var order = tempList[index];
              //    var goodsArray = order.goods;
              //    order.isSelected = false;
              //    for (var i = 0 ; i < goodsArray.length;i++){
              //      var goodsObject = [i];
              //      goodsObject.isSelected = false;
              //      order.goods = goodsObject;
              //    }
              //    orderTable.push(order);
              //  }
              //}else{
              //
              //  var localOrderArray = JSON.parse(localOrderArrayStr);
              //
              //  //本地表中有数据
              //  for(var index = 0 ; index < tempList.length; index++){
              //    var order = tempList[index];
              //    var orderId = order.order_id;
              //    var goodsArray = order.goods;
              //
              //    //1. 判断该订单下是否所有的商品都被选中
              //    //var
              //
              //
              //  }
              //
              //
              //}

              //  tempList = orderTable
              //}

              if (tempList.length == 0 && params.pageno == '1') {
                $scope.errMsg = '没有相关数据';
              } else {
                $scope.errMsg = '';
                if (tempList.length < params.pagesize) {
                  isAll = true;//true:标志数据加载完成
                  defer.resolve(isAll);
                } else {
                  isAll = false;
                  defer.resolve(isAll);
                }
                if (params.direction == 'down') {
                  $scope.orderList = response.data;
                } else {
                  $scope.orderList = $scope.orderList.concat(tempList);
                }
              }
              break;
            case '-8':
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
              break;
          }
        });
        return defer.promise;
      };

      function currentMenu(type) {
        var current;
        switch (type) {
          case '0':
            current = '.status-obligation';
            break;
          case '1':
            current = '.status-delive';
            break;
          case '2':
            current = '.status-refund';
            break;
          case '3':
            current = '.status-aldelive';
            break;
          case '4':
            current = '.status-regood';
            break;
          case '5':
            current = '.status-completed';
            break;
          case '6':
            current = '.status-algood';
            break;
          case '7':
            current = '.status-all';
            break;
          default:
            current = '.status-obligation';
            break;
        }
        return current;
      }

      //默认显示订单状态
      if (toSkipHere == 'comservice' || toSkipHere == 'usercenter') {
        //从首页或者个人中心进入我的订单页
        $scope.showType = '0'; //默认显示待付款订单
        localStorage.showType = '0';
        //localStorage.statusElem = '.status-obligation';
      }
      /*else if(toSkipHere == 'productJudge' || toSkipHere == 'orderDetail'){
       //商品评价成功后，返回到我的订单页 && 订单详情页返回到我的订单页
       $scope.showType = localStorage.showType;

       //返回到之前记住的滚动位置
       //$('.myorder-tabs').scrollLeft(Number(localStorage.scrollLeft));
       }*/
      $scope.showType = localStorage.showType;
      var statusElem = currentMenu(localStorage.showType);
      $('.myorder-tabs-ul li').removeClass('selectedOrder');
      $(statusElem).addClass('selectedOrder');
      if (localStorage.showType == '7') {
        $scope.orderParams.status = '';
      } else {
        $scope.orderParams.status = localStorage.showType;
      }
      $scope.getOrders($scope.orderParams);

      //点击选项卡，切换显示数据
      $scope.showOrderData = function (type, $event, elem) {
        $scope.orderList = [];
        $scope.orderParams.direction = 'down';
        $('.search-input').val('');
        $scope.errMsg = '';
        $('.myorder-tabs-ul li').removeClass('selectedOrder');
        $($event.target).addClass('selectedOrder');
        $scope.showType = type;
        if (type == '7') {
          $scope.orderParams.status = '';
        } else {
          $scope.orderParams.status = type;
        }
        localStorage.showType = type;
        $scope.orderParams.pageno = 1;
        $scope.getOrders($scope.orderParams);
      };

      //记录滚动条的位置
      /*$('.myorder-tabs').scroll(function(){
       $scope.scrollLeft = $(this).scrollLeft();
       });*/

      /***********关键字搜索*****************/
      var val = '';
      $scope.searchOrder = function () {
        $scope.orderList = [];
        val = $('.search-input').val();
        $scope.orderParams.key = val;
        $scope.orderParams.pageno = 1;
        $scope.getOrders($scope.orderParams);
      };
      //失去焦点时，获取key值
      $scope.orderBlur = function () {
        $scope.orderParams.key = $('.search-input').val();
      };

      //返回
      $scope.goBack = function () {
        val = $('.search-input').val();
        if (val != '') {
          $('.search-input').val('');
          $scope.searchOrder();
          return;
        }
        var from = $stateParams.from;
        //社区服务-订单
        if (localStorage.goBack == 'comservice') {
          $state.go('guanjia-comservice');
        }
        if (localStorage.goBack == 'usercenter') {
          $state.go('member-personal-usercenter');
        }
      };
      //点击订单跳转到订单详情
      $scope.goOrderDetail = function (orderId) {
        sessionStorage.orderDetailfrom = 'order';
        $state.go('member-user-orderdetail', {
          orderId: orderId,
          from: 'order'
        });
        //记录跳转到订单详情页时滚动条的scrollLeft值
        //localStorage.scrollLeft = $scope.scrollLeft;
      };

      //保存勾选的订单以及商品id
      var selectedOrdersArray = [];


      //操作完成之后的提示信息
      var requestSuccessMessage = "";

      //删除商品
      $scope.isSureDelete = function (parent) {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(parent, ["待付款", "已完成", "已退货", "已退款"]);
        var params = selctedOrderParams.apiParams;
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("只能删除商品状态为待付款、已完成、已退货、已退款！");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(0, "确定删除所选商品?");
        }
      };

      //支付
      $scope.goToPay = function (parent) {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(parent, ["待付款"]);
        var params = selctedOrderParams.apiParams;
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[2];
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("您选择了非待付款的商品，请重新选择");
        } else if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了失效商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(1, "确定支付?");
        }


        //var orderLists = $(parent).find('.orderSure');
        //var orderIdList = []; //存储需支付的订单号
        //$.each(orderLists,function(index,domEl) {
        //  if ($(domEl).hasClass('checked')) {
        //    //如果是待付款的订单，查询订单下的商品是否都为待付款状态
        //    var orderId = $(domEl).next().html();
        //    orderIdList.push(orderId);
        //  }
        //});


        /*
         * add by yincong 19/09/2016
         * line 252~256
         * 用作保存勾选状态的调试用
         */
        //var savedOrderArrayStr =  localStorage.selectedUnpaidOrder
        //var savedOrderArray = JSON.parse(savedOrderArrayStr);
        //console.log(savedOrderArray);
        //
        //return;

      };

      //退款
      $scope.goRefund = function () {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".tosend-message-table", ["待发货"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了非待发货的商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(2, "确定退款?");
        }

      };

      //取消退款
      $scope.cancelRefund = function () {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".tobackmoney-message-table", ["已退款"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了非已退款的商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {
          console.log(111);
          selectedOrdersArray = params;
          showModal(3, "确定取消退款?");
        }


      }

      //退货
      $scope.returnGoods = function (parents) {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(parents, ["已发货", "已完成"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        var hadDaoZhanGoods = selctedOrderParams.hadInvalidGoods[4];    //判断是否有勾选到站类的商品
        var hadNonDaoZhanGoods = selctedOrderParams.hadInvalidGoods[5];    //判断是否有勾选非到站类的商品
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您勾选了非已发货或已完成的商品，请重新选择");
        } else if (parents == '.finish-message-table' && hadNonDaoZhanGoods) {
          //如果是在已完成中勾选了非到站类的商品,则不能退货
          commonService.showErrorMessage("您勾选了非到站类的商品,请重新选择");

        } else if (params.length == 0) {
          commonService.showErrorMessage("请勾选商品！");
        } else {

          selectedOrdersArray = params;
          showModal(4, "确定退货?");
        }

      }

      //取消退货
      $scope.cancelReturn = function () {

        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".toback-message-table", ["待退货"]);
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        var params = selctedOrderParams.apiParams;
        if (hadInvalidGoods) {
          commonService.showErrorMessage('您选择了非待退货的商品，请重新选择');
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(5, "确定取消退货?");
        }


      }

      //确认收货
      $scope.confirmGoods = function (parent) {


        if ($scope.orderList.length == 0) {
          commonService.showErrorMessage("没有相关数据");
          return;
        }

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(parent, ["已发货"]);
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];  //判断是否勾选有非对应状态中的商品
        var hadDaoZhanGoods = selctedOrderParams.hadInvalidGoods[4];    //判断是否有勾选到站类的商品
        var params = selctedOrderParams.apiParams;
        if (hadInvalidGoods) {
          commonService.showErrorMessage('您选择了非已发货的商品，请重新选择');
        } else if (hadDaoZhanGoods) {
          commonService.showErrorMessage('您选择了到站类的商品，不能手工确认收货');
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        }
        else {

          selectedOrdersArray = params;
          showModal(6, "确定收货?");
        }

      };

      //取消确认收货
      $scope.cancelConfirm = function (parent) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(parent, ["已完成"]);
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];  //判断是否勾选有非对应状态中的商品
        var hadDaoZhanGoods = selctedOrderParams.hadInvalidGoods[4];    //判断是否有勾选到站类的商品
        var hadTimeOutGoods = selctedOrderParams.hadInvalidGoods[3]; //判断是否勾选了确认收货后超过60s的商品
        var params = selctedOrderParams.apiParams;
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("您选择了非已完成的商品,请重新选择!");
        } else if (hadDaoZhanGoods) {
          commonService.showErrorMessage('您选择了到站类的商品，请重新选择');
        } else if (hadTimeOutGoods) {
          commonService.showErrorMessage("您选择了确认收货超过" + $rootScope.cancel_confirm_order + "分钟的商品!");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品!");
        } else {

          selectedOrdersArray = params;
          showModal(7, "确定取消收货?");
        }
      };

      //点击评价，跳转到商品评价设置页
      $scope.goJudge = function (good, orderId) {

        event.stopPropagation();

        //进商品评价之前将当前评价的商品信息通过保存在本地的方式传递
        good.orderId = orderId;
        localStorage.judgeGoods = JSON.stringify(good);
        $state.go('member-user-productjudge', {
          goodId: good.goods_id,
          goodDetail: {
            orderId: orderId,
            imageUrl: good.imageUrl,
            name: good.name,
            guige: good.guige,
            sale_price: good.sale_price,
            count: good.count,
            unit: good.unit,
            delivery: good.delivery,
            service_station: good.service_station,
            coupons: good.cpupons,
            status: good.status,
            remark: good.remark
          }
        });
      };


      //点击商品，前往商品详情
      $scope.toGoodsDetail = function (goods, business_id) {
        $cookies.put('businessId', business_id);
        localStorage.goodsId = goods.goods_id;
        localStorage.goodsDetailFrom = "%orderList%";
        localStorage.goodsDetailFromId = goods.orderItem_id;
        $state.go('service-goodsDetail');
      }

      /********************************** 我的订单可进行的操作 *******************************/
      /* 删除、支付、退款、取消退款、退货、取消退货、确认收货、取消确认收货  */

      // 1. 删除
      var deleteGoods = function (paramsStr) {
        dealGoods("delOrder.action", paramsStr, 0);
      }

      // 2. 支付
      var buyGoods = function () {
        sessionStorage.isFrom = 2;
        payCacheService.setProperty('orderId', selectedOrdersArray);
        payCacheService.getProperty("orderId");
        $state.go("guanjia-pay", {
          "from": "2",
          obj: {}
        });
      }

      // 3. 退款
      var goodsRefund = function (paramsStr) {
        dealGoods("refundOrder.action", paramsStr, 2);
      }

      // 4. 取消退款
      var cancelTheRefund = function (paramsStr) {
        dealGoods("cancelRefundOrder.action", paramsStr, 3);
      }

      // 5. 退货
      var returnedPurchase = function (paramsStr) {
        dealGoods("returnOrder.action", paramsStr, 4);
      }

      // 6. 取消退货
      var cancelReturnedPurchase = function (paramsStr) {
        dealGoods("cancelReturnOrder.action", paramsStr, 5);
      }

      // 7. 确认收货
      var consigneeGoods = function (paramsStr) {
        dealGoods("confirmOrder.action", paramsStr, 6);
      }

      // 8. 取消确认收货
      var cancelConsigneeGoods = function (paramsStr) {
        dealGoods("cancelConfirmOrder.action", paramsStr, 7);
      }

      /************************************************************************************/

      /*
       * 点击我的订单中的按钮弹出确认模态框，防止用户误操作
       * @params msg  在模态框中现实的信息
       * @params code 模态框中点击确定按钮执行命令的标识符
       */
      var showModal = function (code, msg) {
        $('#receive').css('display', 'block');
        $scope.tipsMessage = msg;
        $scope.code = code;
      }

      /*
       * 点击我的订单中的按钮弹出确认模态框，点击模态框的确定，发起请求
       * @params url    请求的url
       * @params params 请求的参数
       * @params tag    操作的标识符 0,删除
       *                           2，退款
       *                           3，取消退款
       *                           4，退货
       *                           5，取消退货
       *                           6，确认收货
       *                           7，取消确认收货
       */

      //请求
      var dealGoods = function (url, apiParams, tag) {
        userService.postRequestWithUrlAndParams(url, apiParams).success(function (response) {

          if (response.code == '0') {


            if (tag == 6 && response.data.length > 0) {
              commonService.showErrorMessage(response.data + '确认收货失败');
            } else {
              commonService.showSuccessMessage(requestSuccessMessage);
            }
            $scope.orderList = [];
            var all = $('.order-container').find('.all');
            $.each(all, function (index, domEl) {
              $(domEl).removeClass('checked');
              $(domEl).attr('src', 'images/sure-icon.png');
            });
            reloadData();

          } else {

            //取消退款时账户余额不足以支付,此时进支付页
            if (tag == 3) {
              if (response.code == '-5') {
                var orderNo = response.data;
                payCacheService.setProperty("orderId", orderNo);
                //下单成功，前往支付页
                sessionStorage.isFrom = 2;
                $state.go('guanjia-pay', {
                  from: 2,
                  obj: {
                    orderIds: orderNo
                  }
                });
              } else {
                commonService.showWarnMessage(response.data);
              }
            } else {
              commonService.showWarnMessage(response.data);
            }

          }
        }).error(function (data, status, header, config) {

        });
      }

      /*
       * 点击我的订单中的按钮弹出确认模态框，防止用户误操作
       * @params code 模态框中点击确定按钮执行命令的标识符
       *         code ＝ 0 删除
       *         code ＝ 1 支付
       *         code ＝ 2 退款
       *         code ＝ 3 取消退款
       *         code ＝ 4 退货
       *         code ＝ 5 取消退货
       *         code ＝ 6 确认收货
       *         code ＝ 7 取消确认收货
       */
      $scope.sureAction = function (code) {
        //隐藏模态框
        $('#receive').css('display', 'none');
        var apiParamsStr = {json: JSON.stringify(selectedOrdersArray)};
        if (code == 0) {  //删除
          requestSuccessMessage = "删除成功!";
          deleteGoods(apiParamsStr);
        }
        if (code == 1) {  //支付
          buyGoods();
        }
        if (code == 2) {   //退款
          requestSuccessMessage = "退款成功!";
          goodsRefund(apiParamsStr);
        }
        if (code == 3) {  //取消退款
          requestSuccessMessage = "取消退款成功!";
          cancelTheRefund(apiParamsStr);
        }
        if (code == 4) {  //退货
          requestSuccessMessage = "申请退货成功!";
          returnedPurchase(apiParamsStr);
        }
        if (code == 5) {  //取消退货
          requestSuccessMessage = "取消申请退货成功!";
          cancelReturnedPurchase(apiParamsStr);
        }
        if (code == 6) {  //确认收货
          requestSuccessMessage = "确认收货成功!";
          consigneeGoods(apiParamsStr);
        }
        if (code == 7) {  //取消确认收货
          requestSuccessMessage = "取消确认收货成功!";
          cancelConsigneeGoods(apiParamsStr);
        }

      }


      /*
       * 订单的操作完成后重新请求数据
       */
      var reloadData = function () {
        $scope.orderParams.pageno = 1;
        $scope.getOrders($scope.orderParams);
      }


    }]);
//商品评价
orderModuleController.controller(
    'goodsJudgeCtrl',
    function ($scope, $stateParams, userService, $state, $rootScope, commonService, $cookies, $timeout, payCacheService, $location) {

      var judgeGoods = JSON.parse(localStorage.judgeGoods);
      //接受由订单传过来的商品
      var goodsId = judgeGoods.goods_id;
      //var goodsInfo = $stateParams.goodDetail;
      var orderId = judgeGoods.orderId;
      var orderItemId = judgeGoods.orderItem_id;
      $scope.commentGoodsImageUrl = judgeGoods.imageUrl;
      $scope.commentGoodsName = judgeGoods.name;
      $scope.commentGoodsPrice = judgeGoods.sale_price;
      $scope.commentGoodsCount = judgeGoods.count;
      $scope.commentGoodsUnit = judgeGoods.unit;
      //$scope.commentGoodsSpecifications = goodsInfo.guige;
      //$scope.commentGoodsServiceStation = goodsInfo.service_station;
      //$scope.commentGoodsServiceDelivery = goodsInfo.delivery;
      //$scope.commentGoodsCoupons = goodsInfo.coupons;

      $scope.guige1 = judgeGoods.guige_1;
      $scope.guige2 = judgeGoods.guige_2;

      //新增评价
      if (judgeGoods.comment.length == 0) {
        $scope.commentContent = "";
        $scope.star = 0;
      } else {
        //修改评价
        var apiParams = {"goods_comment_id": judgeGoods.comment, "ticket": $cookies.get('ticket')}
        //获取商品评价信息
        userService.postRequestWithUrlAndParams("getGoodsComment.action", apiParams).success(function (response) {
          switch (response.code) {
            case '0':
              $scope.commentContent = response.data.content;
              var starCount = parseInt(response.data.star);
              $scope.comPics = response.data.tupian;

              var width = starCount / 5 * 100 + '%';
              $('.rating-stars').css({
                'width': width
              });
              break;
            case '-1':
              console.log("参数为空!");
              break;
            case '-2':
              console.log("参数错误!");
              break;
            case '-3':
              commonService.showErrorMessage(response.data);
              break;
            case '-8':
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
              break;
          }
        }).error(function (data, status, header, config) {

        });
      }

      $scope.back = function () {
        localStorage.skip = 'productJudge';
        history.back();
      };


      //获取用户评分
      var userScore = 5;
      $('#star').on('rating.change', function (event, value, caption) {
        userScore = value;
      });

      //用户提交评论
      $scope.submitUserAppraise = function () {

        var commentImageList = [];
        var imageList = $('.weui_uploader_files').find('.weui_uploader_file');
        for (var index = 0; index < imageList.length; index++) {
          var imageDiv = imageList[index];
          var imageData = imageDiv.style.backgroundImage;

          var updateImageDate = imageData.substr(imageData.indexOf(','), imageData.indexOf(")"));
          updateImageDate = updateImageDate.substr(1, updateImageDate.length - 1);
          updateImageDate = updateImageDate.substr(0, updateImageDate.length - 2);
          commentImageList.push(updateImageDate);
        }

        //多张图片的base64编码以字符串方式传输
        var imageBase64String = commentImageList.toString();

        //*********************************上传图片 end ************************************
        //判断编辑前后是否有图片
        var imgSrc;
        var imgSrcList = [];
        var elem_imgSrc = $('.editBbsImg');
        for (var i = 0; i < elem_imgSrc.length; i++) {
          imgSrc = $(elem_imgSrc[i]).attr('ng-src');
          imgSrcList.push(imgSrc)
        }
        var imgSrcData = imgSrcList.join(',');


        if (imgSrcData && imageBase64String != '') {
          $scope.pictrueObj = imgSrcData + ',' + imageBase64String;
          console.log('都不为空');
        } else if (imageBase64String != '') {
          console.log('原本无');
          $scope.pictrueObj = imageBase64String;
        } else {
          console.log('后来无');
          $scope.pictrueObj = imgSrcData;
        }


        //用户评价内容
        var content = $('.comment-goods-commentcontent').val();

        var url = "addGoodsComment.action";
        var params = {
          "mobile": localStorage.mobile,
          "goods_id": goodsId,
          "order_id": orderId,
          "star": userScore,
          "content": content,
          "pictrue": $scope.pictrueObj,
          "orderItem_id": orderItemId
        };

        //编辑评价
        if (judgeGoods.comment.length > 0) {
          url = "editGoodsComment.action";
          params["goods_comment_id"] = judgeGoods.comment;
          params["ticket"] = $cookies.get('ticket')
        }

        if (!$cookies.get('ticket')) {
          commonService.showWarnMessage("账号不能为空，请登录！");
          return;
        } else if (!params.content && !params.pictrue) {
          commonService.showWarnMessage("请输入您的评论或上传图片！");
          return;
        }


        userService.postRequestWithUrlAndParams(url, params).success(function (response) {
          switch (response.code) {
            case '0':
              commonService.showSuccessMessage("评价成功!");
              //评价成功后，跳转回我的订单页--已完成
              localStorage.skip = 'productJudge';
              $timeout(function () {
                history.back();
              }, 500);
              break;
            case '-1':
              console.log("参数为空!");
              break;
            case '-2':
              console.log("参数错误!");
              break;
            case '-3':
              commonService.showErrorMessage(response.data);
              break;
            case '-8':
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
              break;
          }
        }).error(function (data, status, header, config) {

        });

      }
    }
);

//订单详情页
orderModuleController.controller(
    'orderDetailCtrl',
    function ($scope, $stateParams, userService, $state, $rootScope, $location, commonService, $timeout, $cookies, payCacheService) {
      $cookies.remove('businessId');
      //记录跳转到订单详情页的页面
      var skipType = localStorage.skip;
      $scope.skipType = skipType;

      //保存该订单下的所有商品的状态
      $scope.showStatus = [];
      //获得order reserve
      $scope.from = $stateParams.from;

      /*
       * 在原基础上添加了sessionStorage.orderDetailFrom，当用户在订单详情页面停留，用另一台设备将当前账号挤下去然后再点击支付，
       * 此时需登录，登录完成后在支付页面点击返回需要回到订单详情并且有数据
       *
       */

      //从消息详情页跳转过来，记录type值
      var type = $stateParams.type;
      if ($scope.from == 'order' || $scope.from == 'coupondetail' || sessionStorage.orderDetailfrom == 'order' || skipType == 'orderDetail' || type == 'order') {
        $scope.detail_title = '订单详情';
      }
      if ($scope.from == 'reserve' || sessionStorage.orderDetailfrom == 'reserve' || skipType == 'reserveDetail' || type == 'appointment') {
        $scope.detail_title = '预约单详情';
      }

      $scope.from = sessionStorage.orderDetailfrom;

      var orderId = $stateParams.orderId;
      if (orderId == undefined) {
        orderId = sessionStorage.orderDetailOrderId;
      } else {
        sessionStorage.orderDetailOrderId = orderId;
      }

      userService.getOrder({
        'order_id': orderId
      }).success(function (data) {

        if (data.code == '0') {
          $scope.orderDetail = data.data;
          //$scope.showStatus：用于判断当前订单详情页上应该出现的按钮
          $.each($scope.orderDetail.goods, function (index, info) {
            if ($scope.showStatus.indexOf(info.status) == -1) {
              $scope.showStatus.push(info.status);
            }
          });
        } else if (data.code == '-8') {
          //前往登录
          sessionStorage.loginLocation = $location.path();
          $state.go('member-personal-login');
        } else {
          commonService.showErrorMessage(data.data);
        }

      }).error(function (data, status, header, config) {

      });

      //返回
      $scope.goBack = function () {
        if ($scope.from == 'order' || sessionStorage.orderDetailfrom == 'order') {
          $state.go('member-user-myorder', {"from": 1});
          localStorage.skip = 'orderDetail';
        } else if ($scope.from == 'reserve' || sessionStorage.orderDetailfrom == 'reserve') {
          $state.go('member-user-reserve');
        } else if ($scope.from == 'coupondetail') {
          $state.go('member-user-coupondetail', {
            couponsId: localStorage.couponsId
          });
        } else {
          $state.go('member-user-myorder', {"from": 1});
          localStorage.skip = 'orderDetail';
        }
        //返回到消息详情页
        if (skipType == 'messagedetail') {
          $state.go("member-user-messagedetail", {messageId: localStorage.msgId});
        }
        sessionStorage.removeItem('orderDetailfrom');
        sessionStorage.removeItem('orderDetailOrderId');
      };


      var selectedOrdersArray = [];
      var requestSuccessMessage = "";
      //点击删除按钮，弹出模态框
      $scope.deleteGoods = function () {
        var temps = null;
        if ($scope.from == 'reserve' || sessionStorage.orderDetailfrom == 'reserve') {
          temps = ['待服务', '已完成'];
        } else {
          temps = ["待付款", "已完成", "已退货", "已退款"];
        }
        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", temps);
        var params = selctedOrderParams.apiParams;
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("只能删除商品状态为" + temps);
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(0, "确定删除所选商品?");
        }

      }

      //进入支付页
      $scope.jumpPay = function () {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["待付款"]);
        var params = selctedOrderParams.apiParams;
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[2];
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("您选择了非待付款的商品，请重新选择");
        } else if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了失效商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          //var order = params[0];
          //payCacheService.setProperty("orderId",params); //参数，非单纯的orderId
          //payCacheService.setProperty("detailOrderId",order.order_id);
          //sessionStorage.isFrom = 4;
          //$state.go("guanjia-pay",{"from":"4", obj:{}});

          selectedOrdersArray = params;
          showModal(1, "确定支付?");
        }

      }

      //退款
      $scope.refund_detail = function (orderId) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["待发货"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了非待发货的商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(2, "确定退款?");
        }

      };

      //取消退款
      $scope.cancelRefund_detail = function (orderId) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["已退款"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您选择了非已退款的商品，请重新选择");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {

          selectedOrdersArray = params;
          showModal(3, "确定取消退款?");
        }

      }

      //订单退货
      $scope.return_detail = function (orderId) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["已发货", "已完成"]);
        var params = selctedOrderParams.apiParams;
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        if (hadInvalidGoods) {
          commonService.showErrorMessage("您勾选了非已发货的商品，请重新勾选");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请勾选商品！");
        } else {

          selectedOrdersArray = params;
          showModal(4, "确定退货?");
        }

      }

      //取消退货
      $scope.cancelReturn_detail = function (orderId) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["待退货"]);
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];
        var params = selctedOrderParams.apiParams;
        if (hadInvalidGoods) {
          commonService.showErrorMessage('您选择了非待退货的商品，请重新选择');
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        } else {
          selectedOrdersArray = params;
          showModal(5, "确定取消退货?");
        }


      }

      //确认收货
      $scope.confirm_detail = function (orderId) {


        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["已发货"]);
        var hadInvalidGoods = selctedOrderParams.hadInvalidGoods[0];  //判断是否勾选有非对应状态中的商品
        var hadDaoZhanGoods = selctedOrderParams.hadInvalidGoods[4];    //判断是否有勾选到站类的商品
        var params = selctedOrderParams.apiParams;
        if (hadInvalidGoods) {
          commonService.showErrorMessage('您选择了非已发货的商品，请重新选择');
        } else if (hadDaoZhanGoods) {
          commonService.showErrorMessage('您选择了到站类的商品，不能手工确认收货');
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品！");
        }
        else {

          selectedOrdersArray = params;
          showModal(6, "确定收货?");
        }

      };

      //取消确认收货
      $scope.cancelConfirm_detail = function (orderId) {

        var selctedOrderParams = userService.getSelectedOrdersAndGoods(".orderDetailContent", ["已完成"]);
        var hadOtherStatusGoods = selctedOrderParams.hadInvalidGoods[0];  //判断是否勾选有非对应状态中的商品
        var hadDaoZhanGoods = selctedOrderParams.hadInvalidGoods[4];    //判断是否有勾选到站类的商品
        var hadTimeOutGoods = selctedOrderParams.hadInvalidGoods[3]; //判断是否勾选了确认收货后超过60s的商品
        var params = selctedOrderParams.apiParams;
        if (hadOtherStatusGoods) {
          commonService.showErrorMessage("您选择了非已完成的商品,请重新选择!");
        } else if (hadDaoZhanGoods) {
          commonService.showErrorMessage('您选择了到站类的商品，请重新选择');
        } else if (hadTimeOutGoods) {
          commonService.showErrorMessage("您选择了确认收货超过" + $rootScope.cancel_confirm_order + "分钟的商品!");
        } else if (params.length == 0) {
          commonService.showErrorMessage("请选择商品!");
        } else {
          selectedOrdersArray = params;
          showModal(7, "确定取消收货?");
        }

      };

      //点击商品，前往商品详情
      $scope.toGoodsDetail = function (goods) {
        localStorage.goodsId = goods.goods_id;
        localStorage.goodsDetailFrom = "%orderDetail%";
        localStorage.goosDetailFromId = goods.orderItem_id; //从订单或者购物车进商品详情然后进购买的时候需要传入对应的id
        if ($scope.from == 'reserve') $state.go('guanjia-familyservicedetail', {goodsId: goods.goods_id});
        else $state.go('service-goodsDetail');
      }

      /*
       * 点击我的订单中的按钮弹出确认模态框，防止用户误操作
       * @params msg  在模态框中现实的信息
       * @params code 模态框中点击确定按钮执行命令的标识符
       */
      var showModal = function (code, msg) {
        $('#receive').css('display', 'block');
        $scope.tipsMessage = msg;
        $scope.code = code;
      }

      /*
       * 点击我的订单中的按钮弹出确认模态框，防止用户误操作
       * @params code 模态框中点击确定按钮执行命令的标识符
       *         code ＝ 0 删除
       *         code ＝ 1 支付
       *         code ＝ 2 退款
       *         code ＝ 3 取消退款
       *         code ＝ 4 退货
       *         code ＝ 5 取消退货
       *         code ＝ 6 确认收货
       *         code ＝ 7 取消确认收货
       */
      $scope.sureAction = function (code) {
        var apiParamsStr = {json: JSON.stringify(selectedOrdersArray)};
        if (code == 0) {  //删除
          requestSuccessMessage = "删除成功";
          deleteGoods(apiParamsStr);
        }
        if (code == 1) {  //支付
          buyGoods();
        }
        if (code == 2) {   //退款
          requestSuccessMessage = "退款成功";
          goodsRefund(apiParamsStr);
        }
        if (code == 3) {  //取消退款
          requestSuccessMessage = "取消退款成功";
          cancelTheRefund(apiParamsStr);
        }
        if (code == 4) {  //退货
          requestSuccessMessage = "申请退货成功";
          returnedPurchase(apiParamsStr);
        }
        if (code == 5) {  //取消退货
          requestSuccessMessage = "取消申请退货成功";
          cancelReturnedPurchase(apiParamsStr);
        }
        if (code == 6) {  //确认收货
          requestSuccessMessage = "确认收货成功";
          consigneeGoods(apiParamsStr);
        }
        if (code == 7) {  //取消确认收货
          requestSuccessMessage = "取消确认收货成功";
          cancelConsigneeGoods(apiParamsStr);
        }
      }


      /********************************** 我的订单可进行的操作 *******************************/
      /* 删除、支付、退款、取消退款、退货、取消退货、确认收货、取消确认收货  */

      // 1. 删除
      var deleteGoods = function (paramsStr) {
        dealGoods("delOrder.action", paramsStr);
      }

      // 2. 支付
      var buyGoods = function () {
        var order = selectedOrdersArray[0];
        payCacheService.setProperty("orderId", selectedOrdersArray); //参数，非单纯的orderId
        payCacheService.setProperty("detailOrderId", order.order_id);
        sessionStorage.isFrom = 4;
        $state.go("guanjia-pay", {"from": "4", obj: {}});
      }

      // 3. 退款
      var goodsRefund = function (paramsStr) {
        dealGoods("refundOrder.action", paramsStr);
      }

      // 4. 取消退款
      var cancelTheRefund = function (paramsStr) {
        dealGoods("cancelRefundOrder.action", paramsStr);
      }

      // 5. 退货
      var returnedPurchase = function (paramsStr) {
        dealGoods("returnOrder.action", paramsStr);
      }

      // 6. 取消退货
      var cancelReturnedPurchase = function (paramsStr) {
        dealGoods("cancelReturnOrder.action", paramsStr);
      }

      // 7. 确认收货
      var consigneeGoods = function (paramsStr) {
        dealGoods("confirmOrder.action", paramsStr);
      }

      // 8. 取消确认收货
      var cancelConsigneeGoods = function (paramsStr) {
        dealGoods("cancelConfirmOrder.action", paramsStr);
      }

      /************************************************************************************/

      /*
       * 点击我的订单中的按钮弹出确认模态框，点击模态框的确定，发起请求
       * @params url    请求的url
       * @params params 请求的参数
       */

      //请求
      var dealGoods = function (url, apiParams) {
        userService.postRequestWithUrlAndParams(url, apiParams).success(function (response) {

          if (response.code == '0') {

            commonService.showSuccessMessage(requestSuccessMessage);

            // 1. 如果操作完成后该订单下面已经没有商品，那么此时返回商品详情
            // 2. 操作完成后订单下仍有商品，那么此时仍留在订单详情

            var paramsArray = JSON.parse(apiParams.json);
            var order = paramsArray[0];
            if ($scope.orderDetail.goods.length == 1) {
              //只有一个商品，并且对其操作成功，那么此时应该回到订单列表
              $scope.goBack();
            } else if ($scope.orderDetail.goods.length == order.orderItem_id.length) {
              //用户选中了所有商品进行更改状态，那么此时也应该回到订单列表
              $scope.goBack();
            } else if ($scope.orderDetail.goods.length > order.orderItem_id.length) {
              //用户勾选了部分商品进行操作，此时还有部分商品可以进行操作，因此应该留在订单详情，并刷新数据
              userService.getOrder({
                'order_id': $stateParams.orderId
              }).success(function (data) {
                $scope.orderDetail = data.data;
              }).error(function (data, status, header, config) {

              });
            } else {
              console.log("其他状态判断是否留在订单详情");
            }

          } else {
            commonService.showWarnMessage(response.data);
          }
        }).error(function (data, status, header, config) {

        });
      }


    }
);
