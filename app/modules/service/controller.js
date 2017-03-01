var serviceModuleController = angular.module('serviceModuleController', []);

serviceModuleController.controller(
    'purchaseCtrl',
    function ($scope, $stateParams, $rootScope, guanjiaService, userService, commonService, $state, $window, $location, $cookies, payCacheService) {


      /*
       * operate = 111 从商品详情页
       * operate = 112商品列表
       * localStorage.toPurchase = 5 从登陆页回来
       *
       * operate = 1 选择小区完成后跳转回来
       * operate = 2 选择服务站完成后跳转回来
       * operate = 3 选择我的小区完成后跳转回来
       * operate = 4 从支付页返回
       *
       */


      /*
       *
       *  从购买页跳转的时候需要存储：商品数量，送货方式，选择的服务站名称、id，选择的规格，留言，小区名称、id，姓名，联系电话，楼房号
       *
       */

      //选择完成小区之后，将选择的小区的名称显示出来
      var operate = $stateParams.operate;
      var params = $stateParams.obj;
      var cartId = '';
      // var orderItemId = '';
      if (localStorage.goodsDetailFrom == '%cartList%') {
        cartId = localStorage.goodsDetailFromId;
      }
      // if (localStorage.goodsDetailFrom == '%orderList%' || localStorage.goodsDetailFrom == '%orderDetail%'){
      //   orderItemId = localStorage.goodsDetailFromId;
      // }

      //送货方式的名称,当送货方式的名称中含有服务站时表示需要选择服务站否则选择服务站隐藏
      $scope.selecteDeliveryName = ""; //选中的送货方式的名称
      $scope.selecteDeliveryId = ""; //选中的送货方式的id

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
        localStorage.skip = '购买';
        $state.go('member-user-cart', {from: 0});
      };

      //获取商品信息
      guanjiaService.goodsDetail({
        'goods_id': localStorage.goodsId,
        'service_station_id': sessionStorage.selectedServiceStationId,
        'buy': '1',
        'ticket': $cookies.get('ticket'),
        'cart_id': cartId
      }).success(function (data) {

        if (data.code == 0) {
          $scope.goods = data.data;
          $scope.count = $scope.goods.cart == undefined ? 1 : $scope.goods.cart.count;
          $scope.remark = $scope.goods.cart == undefined ? "" : $scope.goods.cart.remark;

          $scope.delivery = data.data.delivery;
          setTimeout(function () {
            var deliveryW = $('.purchase-express-type').width();
            var rowW = $('.purchase-bottom').width();
            $('.purchase-selct-servicestation').css({
              'width': rowW - deliveryW - 10 + 'px'
            })
          }, 100);


          //给送货方式一个默认值，
          //当从服务列表进入详情，进入购买页。那么默认选中第一个，当从购物车进入详情进入购买那么选中购物车中显示的送货方式
          var deliveryTable = data.data.delivery;
          if (deliveryTable != "" && deliveryTable != undefined && deliveryTable != null) {

            deliveryTypeTable = deliveryTable;

            setTimeout(function () {

              //遍历页面显示的送货方式
              var options = $('#purchase-delivery option');

              //遍历请求到的送货方式
              var isHadSelected = false; //是否有默认选中的送货方式
              for (var i = 0; i < deliveryTable.length; i++) {
                var isSelected = deliveryTable[i].isSelected;
                if (isSelected) {
                  var selctedDeliveryName = deliveryTable[i].name;
                  var selctedDeliveryId = deliveryTable[i].delivery_id;

                  for (var index = 0; index < options.length; index++) {
                    var option = options[index];
                    var value = option.value;
                    var text = option.text
                    if (text == selctedDeliveryName && selctedDeliveryId == value) {
                      $scope.deliveryName = text;
                      $scope.selected = value;
                      $scope.selectedDeliveryName = text; //根据该字段是否隐藏选择服务站按钮
                      $scope.selectedDeliveryId = value;  //存储当前选中的送货方式的id
                      isHadSelected = true;
                      break;
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
                    $scope.deliveryName = text;
                    $scope.selected = value;
                    $scope.selectedDeliveryName = text; //根据该字段是否隐藏选择服务站按钮
                    $scope.selectedDeliveryId = value;  //存储当前选中的送货方式的id
                    option.selected = true;
                    return;
                  }

                }
              }

            }, 0)


          } else {
            deliveryTypeTable = [];
          }


          //获取用户上次选中的服务站，如果没有那么那么置为空
          var currentServiceStation = data.data.service_station;
          if (currentServiceStation == "" || currentServiceStation == undefined) {
            $scope.station_name = "选择服务站";
            $scope.stationId = "";
            sessionStorage.selectedServiceStationId = "";
          } else {

            //只有第一次进来时才默认填充用户上次选择的服务站与小区，当用户在该页面选择了服务站之后不需要再从后台获取数据填充
            $scope.station_name = currentServiceStation.station_name;
            $scope.stationId = currentServiceStation.service_station_id;

            //如果当前显示的提货方式是服务站提货那么就将用户上次选择的服务站存起来

            setTimeout(function () {
              if ($scope.selectedDeliveryName.indexOf('服务站') != -1) {
                sessionStorage.selectedServiceStationId = $scope.stationId;
              }
            }, 0)


          }


          //获取用户上次的地址信息
          var currentCommunity = data.data.user_communtiy;
          if (currentCommunity == "" || currentCommunity == undefined) {
            $scope.username = ($rootScope.username == localStorage.mobile || $rootScope.username == undefined) ? "" : $rootScope.username;
            $scope.telphone = localStorage.mobile;
            $scope.community = "";
            $scope.communityId = "";
            $scope.number = "";
          } else {
            $scope.username = currentCommunity.username;
            $scope.telphone = currentCommunity.telphone;
            $scope.community = currentCommunity.community_name;
            $scope.communityId = currentCommunity.community_id;
            $scope.number = currentCommunity.number;
          }

          //如果有星期规格那么获取用户上次选择的星期规格
          //判断是否有上次选中的星期规格
          setTimeout(function () {

            //默认选中用户上次选中的规格（从服务器获取到的上次选中数据）
            var isHasLastSelectedWeekSpec = false;
            var isHadLastSelctedOtherSpec = false;
            var specArray = data.data.guige;
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
            var guigeList = $('.purchase').find('.guigeList');
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


            //获取商品规格对应的价格以及库存
            guanjiaService.getPriceAndInventory({
              'guige_id': guigeIds,
              'goods_id': localStorage.goodsId,
              'service_station': sessionStorage.selectedServiceStationId
            }).success(function (res) {

              if (res.code == 0) {
                $scope.salePrice = res.data.sale_price;
                $scope.oldPrice = res.data.old_price;
                $scope.goods.inventory = res.data.inventory;

                //根据从那个页面进如购买页从而显示相应的信息
                loadDataAccordingToPage();

                $scope.totalPrice = parseFloat($scope.salePrice) * $scope.count;
              } else {
                $state.go('guanjia-comservice');
              }
            }).error(function (data, status, header, config) {
              commonService.showErrorMessage('系统错误');
            });

          }, 500)

        } else {
          commonService.showErrorMessage(data.data);
        }

      }).error(function (data, status, header, config) {

      });


      /*********************************** 自定义函数 ***************************************/

      function loadDataAccordingToPage() {

        //从商品详情进入购买页，从商品列表进入购买页
        if (operate == 111 || localStorage.toPurchase == 111 || operate == 112 || localStorage.toPurchase == 112) {

          //给联系人电话默认值
          //从商品列表或者商品详情进来在正常情况下是为空的，但是在获取商品详情的时候也会获取用户上次选择的服务站以及小区等信息，
          // 此时会讲这些信息显示出来，因此用户姓名可能不为空
          if ($scope.username == undefined || $scope.username == "") {
            $scope.username = ($rootScope.username == localStorage.mobile || $rootScope.username == undefined) ? "" : $rootScope.username;
          }
          //从商品列表或者商品详情进来在正常情况下是为空的，但是在获取商品详情的时候也会获取用户上次选择的服务站以及小区等信息，
          // 此时会讲这些信息显示出来，因此手机号可能不为空
          if ($scope.telphone == undefined || $scope.telphone == "") {
            $scope.telphone = localStorage.mobile;
          }

          //不是在未登录进来后进入登录页面，登录完成后回到该页面，此时不清楚存储的信息否则就清掉
          // if (localStorage.toPurchase != 5) {
          //   localStorage.removeItem('resPurchaseInfo');
          // }
        }

        if (operate == 1 || localStorage.toPurchase == 1) {
          loadPurchaseInfoFromCache();
        }

        //选择服务站返回，
        if (operate == 2 || localStorage.toPurchase == 2) {
          loadPurchaseInfoFromCache();
          // uploadUserSelectedInfo(0);
        }
        //选择我的小区返回
        if (operate == 3 || localStorage.toPurchase == 3) {
          loadPurchaseInfoFromCache();
          // uploadUserSelectedInfo(2);
        }

        //放弃支付,回到购买页
        if (operate == 4 || localStorage.toPurchase == 4) {
          loadPurchaseInfoFromCache();
        }
        //未登录强制跳到登录页后返回
        if (localStorage.toPurchase == 5) {
          loadPurchaseInfoFromCache();
        }
      }


      /************************************** end ******************************************/


      /************************************ 初始化  ****************************************/
      $scope.formData = {};
      if (null != sessionStorage.obj) {
        goodsObj = sessionStorage.obj;
        goodsList = JSON.parse(goodsObj);
        if (goodsList.goodsId == localStorage.goodsId) {
          if (goodsList.goodsCount != null) {
            $scope.count = parseFloat(goodsList.goodsCount);
          }
        } else {
          $scope.count = 1;
        }
      } else {
        //给商品一个默认的count
        $scope.count = 1;
      }
      /************************************** end ******************************************/

      //保存页面信息
      function savePurchaseInfo() {
        //获取规格并保存
        var guige_1 = '';
        var guige_2 = '';

        var selectList = $('.purchase').find('.guigeSelect');
        selectList.each(function (index, select) {
          if (index == 0) {
            guige_1 = $(select).find("option:selected").val();
          } else {
            guige_2 = $(select).find("option:selected").val();
          }
        });


        //在选择我的小区之前也需要将当前页面的可操作信息保存
        var goodsNum = $scope.count;                   //用户选择的商品数量
        var selected = $scope.selected;                //用户选择的提货方式
        var stationName = $scope.station_name;         //服务站名称
        var stationId = $scope.stationId;              //服务站id
        var remarks = $scope.remark;                   //用户留言
        var userName = $scope.username;                //联系人
        var telphone = $scope.telphone;                //联系电话
        var number = $scope.number;                    //楼号
        var communityName = $scope.community;          //小区名称
        var communityId = $scope.communityId;          //小区id

        var deliveryId = $scope.selected     //送货方式id
        var deliveryName = ""; //送货方式名称
        for (var index = 0; index < $scope.delivery.length; index++) {
          var delObject = $scope.delivery[index];
          if (deliveryId == delObject.delivery_id) {
            deliveryName = delObject.name;
          }
        }

        var purchaseInfo = {
          "goodsNum": goodsNum,
          "selected": selected,
          "stationName": stationName,
          "stationId": stationId,
          "remarks": remarks,
          "userName": userName,
          "telphone": telphone,
          "number": number,
          "communityName": communityName,
          "communityId": communityId,
          "guige1": guige_1,
          "guige2": guige_2,
          "deliveryName": deliveryName,
          "deliveryId": deliveryId,
          "hahahah": "hahahha"
        }

        //将要传递的参数存起来
        var paramsStr = JSON.stringify(purchaseInfo);
        localStorage.resPurchaseInfo = paramsStr;
        return purchaseInfo;
      }

      //从缓存中获取页面信息
      function loadPurchaseInfoFromCache() {
        //返回购买页之前用sessionStorage将要传递回去的参数存起来
        var paramsStr = localStorage.resPurchaseInfo;
        if (paramsStr != null && paramsStr != undefined) {

          params = JSON.parse(paramsStr);

          //选择小区完成
          var goodsNum = params.goodsNum;                  //用户选择的商品数量
          var selected = params.selected;               //用户选择的提货方式
          var stationName = params.stationName;         //服务站名称
          var stationId = params.stationId;           //服务站id
          var remarks = params.remarks;                  //用户留言
          var userName = params.userName;               //联系人
          var telphone = params.telphone;                //联系电话
          var number = params.number;                   //楼号
          var communityName = params.communityName;         //小区名称
          var communityId = params.communityId;          //小区id
          var deliveryName = params.deliveryName;
          var deliveryId = params.deliveryId;

          $scope.count = goodsNum;                //用户选择的商品数量
          $scope.selected = selected;             //用户选择的提货方式
          $scope.station_name = stationName;      //服务站名称
          // $scope.stationId = stationId;        //服务站id
          $scope.remark = remarks;                  //用户留言
          $scope.username = userName;            //联系人
          $scope.telphone = telphone;            //联系电话
          $scope.number = number;                //楼号
          if ($scope.community == '') {
            //小区名称
            $scope.community = communityName;
            //小区id
            $scope.communityId = communityId;

          }
          //将当前列出来的送货方式与存储的送货方式比较，如果能够在当前的列表中找到存储的送货方式那么就显示存储的送货方式，否则就显示第一个送货方式
          var options = $('#purchase-delivery option');
          var hadSavedDelivery = false;
          for (var index = 0; index < options.length; index++) {
            var option = options[index];
            var value = option.value;
            var text = option.text
            if (value == deliveryId) {
              //显示存储的送货方式
              $scope.deliveryName = text;
              $scope.selected = value;
              $scope.selectedDeliveryName = text; //根据该字段是否隐藏选择服务站按钮
              $scope.selectedDeliveryId = value;  //存储当前选中的送货方式的id
              option.selected = true;
              hadSavedDelivery = true;
            }
          }

          //如果在列表中没有找到当前存储的送货方式，那么选中第一个非空的送货方式
          if (!hadSavedDelivery) {
            for (var index = 0; index < options.length; index++) {
              var option = options[index];
              var value = option.value;
              var text = option.text
              if (text == '' || value.indexOf('?') != -1) {
                option.remove();
              } else {
                $scope.deliveryName = text;
                $scope.selected = value;
                $scope.selectedDeliveryName = text; //根据该字段是否隐藏选择服务站按钮
                $scope.selectedDeliveryId = value;  //存储当前选中的送货方式的id
                option.selected = true;
                return;
              }
            }
          }

          localStorage.removeItem('resPurchaseInfo');
          var deliveryW = $('.purchase-express-type').width();
          var rowW = $('.purchase-bottom').width();
          $('.purchase-selct-servicestation').css({
            'width': rowW - deliveryW - 10 + 'px'
          });

          //从其他页面返回显示跳转之前显示的规格
          //设置选中的规格,星期规格从后台获取，不需要从
          var selectList = $('.purchase').find('.guigeSelect');
          //只有一个规格，判断是否是星期规格
          if (selectList.length == 1) {
            var select = selectList[0];
            if ($(select).attr('name') != '星期') {
              $(select).val(params.guige1);
            }
          } else if (selectList.length == 2) {
            var select = selectList[1];
            $(select).val(params.guige2);
          }
          // for (var index = 0; index < selectList.length; index++) {
          //
          //   var guige1Name = params.guige1;
          //   var guige1 = guigeList[index];
          //
          //   var sepcNameDivs = $(guige1).find('.purchase-spec-name');
          //   var sepcNameDiv = sepcNameDivs[0];
          //   var sepcName = $(sepcNameDiv).html();
          //   if (sepcName != '星期：') {
          //     var select = $(guige1).find('.guigeSelect')[0];
          //     for (var i = 0; i < select.options.length; i++) {
          //       if (select.options[i].innerHTML == guige1Name) {
          //         select.options[i].selected = true;
          //         break;
          //       }
          //     }
          //   }
          // }


        }
      }


      /*********************************** 页面事件监听 *************************************/
      //从所有的小区中选择小区
      $scope.selectCommunity = function () {
        var purchaseInfo = savePurchaseInfo();
        $state.go('member-user-selectcommunity', {operate: 2, obj: purchaseInfo});
      };

      //选择服务站
      $scope.jumpselectStation = function (id) {

        var purchaseInfo = savePurchaseInfo();
        localStorage.selectStationFrom = 1;
        $state.go('service-selectStation', {operate: 1, obj: purchaseInfo});

      };

      //跳转到选择我的小区
      $scope.jumpToMyCommunitySelect = function () {

        var purchaseInfo = savePurchaseInfo();

        if ($cookies.get('ticket') == null) {
          localStorage.toPurchase = 5
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else {
          localStorage.toMyCommunitySelect = 3;
          ////添加标识符，用以判断是否选择了小区（若选择了我的小区此时选择服务站不会自动填充小区）
          sessionStorage.isSelectedMyCommunity = 0;
          $state.go('service-mycommunityselect', {operate: 3, obj: purchaseInfo});

        }
      };


      //当送货方式更改时
      $scope.selChange = function () {

        //找到当前的送货方式
        for (var index = 0; index < deliveryTypeTable.length; index++) {
          var delivery = deliveryTypeTable[index];
          if (delivery.delivery_id == $('#purchase-delivery option:selected').val()) {
            //找到当前选中的送货方式
            $scope.selectedDeliveryName = delivery.name;
            $scope.selectedDeliveryId = delivery.delivery_id;
            $scope.selected = delivery.delivery_id;
          }
        }

      };

      $scope.selGuigeId = function () {
        var idStrs = '';
        var tag = false;
        $('select').each(function (index, data) {
          if (index > 0) {
            if (index % 2 == 0 && !tag) idStrs += ',';
            if ($(this).val() == '') tag = true;
            idStrs += $(this).attr('selected', 'selected').val();
          }
        });
        return idStrs;
      }

      //toFixed 方法有bug，不同的浏览器对它的解析不一样。比如，0.009.toFixed(2)在firefox下 为0.01 而在IE7下为
      //0.00
      Number.prototype.toFixed = function (exponent) {
        return parseInt(this * Math.pow(10, exponent) + 0.5) / Math.pow(10, exponent);
      }

      //当规格改变时，查询对应的价格和库存
      $scope.changeGuige = function (guige_id) {
        //当规格改变的时候


        //当修改星期规格的时候上传数据
        var weekSpecId = "";
        var weekSpecName = "";
        var guigeList = $('.purchase').find('.guigeList');
        for (var index = 0; index < guigeList.length; index++) {
          var sepcDiv = guigeList[index];
          var sepcNameDivs = $(sepcDiv).find('.purchase-spec-name');
          var sepcNameDiv = sepcNameDivs[0];
          var sepcName = $(sepcNameDiv).html();
          //只有修改星期规格才上传数据
          if (sepcName == '星期：') {
            var select = $(sepcDiv).find('.guigeSelect')[0];
            for (var i = 0; i < select.options.length; i++) {
              if (select.options[i].selected == true) {
                weekSpecId = select.options[i].value;
                weekSpecName = select.options[i].text;
                break;
              }
            }
          }
        }

        if (weekSpecId != '' && weekSpecName != '') {
          //获取星期规格中括号内的日期
          var start = weekSpecName.indexOf('(') + 1;
          var end = weekSpecName.indexOf(")");
          var date = weekSpecName.substring(start, end)
          //上传用户选择的服务站,选择成功后回去
          var params = {
            "service_station_id": "",
            "xingqi_guige_id": weekSpecId,
            "user_community_id": "",
            "date": date,
            "ticket": $cookies.get("ticket")
          }
          userService.postRequestWithUrlAndParams("saveMySelect.action", params).success(function (response) {

          });

        }


        var idStrs = $scope.selGuigeId();
        guanjiaService.getPriceAndInventory({
          'guige_id': idStrs,
          'service_station': $scope.stationId
        }).success(function (res) {
          switch (res.code) {
            case '0':
              $scope.goods.sale_price = res.data.sale_price;
              $scope.goods.old_price = res.data.old_price;
              $scope.goods.inventory = res.data.inventory;
              $scope.salePrice = $scope.goods.sale_price;
              $scope.oldPrice = $scope.goods.old_price;
              $scope.totalPrice = parseInt($scope.count) * $scope.salePrice;
              sessionStorage.isFromGoodsDetail = 0;
              break;
            case '-1':
              console.log('参数为空！请联系管理员。');
              break;
            case '-2':
              console.log('参数错误！请联系管理员。');
              break;
          }
        }).error(function (data, status, header, config) {
          commonService.showErrorMessage('系统错误');
        });

      };

      //数量加减
      $scope.decrease = function () {
        if ($scope.count > 1) {
          $scope.count -= 1;
        }
        $scope.totalPrice = (parseFloat($scope.salePrice) * $scope.count).toFixed(2);
      };
      $scope.increase = function () {
        $scope.count = parseInt($scope.count) + 1;
        $scope.totalPrice = (parseFloat($scope.salePrice) * $scope.count).toFixed(2);
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
      }

      //返回
      $scope.back = function () {

        sessionStorage.removeItem('selectedServiceStationId');
        localStorage.removeItem('toPurchase');
        localStorage.removeItem('resPurchaseInfo');
        sessionStorage.removeItem('isSelectedMyCommunity');//是否选择我的小区标识符

        var tab = $cookies.get('tab');
        if (tab == null) $state.go('guanjia-commservice')
        else {
          if (tab == '?detail%') $state.go('service-goodsDetail', {goods_id: localStorage.goodsId});
          else if (tab == '?list%') {
            localStorage.skip = 'purchase';
            $state.go('guanjia-goodslist');
          }
          $cookies.remove('tab');
        }
      };

      // 加入购物车
      $scope.addcart = function (id) {

        if ($scope.goods.inventory == 0) {
          commonService.showNoticeMessage("商品库存不足！");
          return;
        }

        var regx = /^\+?[1-9][0-9]*$/;
        var guigeIDs = $('select[name=guigeID]');
        if ($cookies.get('ticket') == null) {
          localStorage.toPurchase = 5;
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else if (!regx.test($scope.count)) {
          commonService.showNoticeMessage('请填写正确数量!');
          $scope.count = 1;
        } else if ($scope.username == null || $scope.username == undefined || $scope.username == "") {
          commonService.showNoticeMessage('请填写联系人！');
        } else if (userService.validateMobile($scope.telphone).validate == false) {
          commonService.showNoticeMessage(userService.validateMobile($scope.telphone).msg);
        } else if ($scope.communityId == null || $scope.communityId == "" || angular.isUndefined($scope.communityId)) {
          commonService.showNoticeMessage('请选择小区！');
        } else {
          var idStrs = '';
          var tag = false;
          var guige_1 = '';
          var guige_2 = '';
          $('select').each(function (index, data) {
            if (index > 0) {
              if (index % 2 == 0) {
                idStrs += ',';
              }
              if ($(this).val() == '') tag = true;
              idStrs += $(this).attr('selected', 'selected').val();
              if (index == 1) guige_1 = $(this).prev().text() + $(this).find('option:selected').text().trim();
              else guige_2 = $(this).prev().text() + $(this).find('option:selected').text().trim();
            }
          });
          var addCartParams = {
            ticket: $cookies.get('ticket'),
            mobile: localStorage.mobile,
            goods_id: localStorage.goodsId,
            count: $scope.count,
            guige: idStrs,
            guige_1: guige_1,
            guige_2: guige_2,
            delivery_id: $scope.selected,
            service_station_id: $scope.stationId,
            remark: $scope.remark,
            contact_name: $scope.username,
            contact_phone: $scope.telphone,
            community_id: $scope.communityId,
            number: $scope.number
          };
          if (localStorage.target != null && localStorage.target == 'article' || localStorage.target == 'ad') {
            addCartParams.target = localStorage.target;
            localStorage.removeItem('target');
          }
          var cart_id = localStorage.getItem('skip');
          if (cart_id != null) addCartParams.cart_id = cart_id.split(':')[2];
          //调用加入购物车接口
          guanjiaService.addcart(addCartParams).success(function (data) {
            //$(".seller-name").text(data.data.name);
            switch (data.code) {
              case '0':
                $scope.cartCount++;
                commonService.showSuccessMessage('添加成功，快去购物车查看吧~');
                break;
              case '-1':
                console.log('参数为空');
                break;
              case '-2':
                console.log('参数错误');
                break;
              case '-3':
                commonService.showErrorMessage(data.data);
                break;
            }
          });
        }
      };
      //模态框取消
      $scope.goBackOther = function () {
        if (localStorage.goodsDetailFrom == '%cartList%') {
          var temp = localStorage.skip.split(':')[0];
          $state.go('member-user-cart', {from: temp});
        } else if (localStorage.goodsDetailFrom == '%orderList%') {
          localStorage.skip = 'orderList';
          $state.go('member-user-myorder');
        } else if (localStorage.goodsDetailFrom == '%orderDetail%') {
          localStorage.skip = 'detailList';
          $state.go('member-user-orderdetail');
        } else {
          localStorage.skip = 'detail';
          $state.go('guanjia-goodslist');
        }
      };

      //直接购买
      $scope.jumptopay = function (id) {
        //保存页面信息
        savePurchaseInfo();

        if ($scope.goods.inventory == 0) {
          commonService.showNoticeMessage("商品库存不足！");
          return;
        }

        var stationId = $scope.stationId;

        var regx = /^\+?[1-9][0-9]*$/;
        if ($cookies.get('ticket') == null) {

          localStorage.toPurchase = 5;
          $state.go('member-personal-login');
          sessionStorage.loginLocation = $location.path();
        } else if (!regx.test($scope.count)) {
          commonService.showNoticeMessage('请填写正确数量!');
        } else if ($scope.username == null || $scope.username == "") {
          commonService.showNoticeMessage('请填写联系人！');
        } else if (userService.validateMobile($scope.telphone).validate == false) {
          commonService.showNoticeMessage(userService.validateMobile($scope.telphone).msg);
        } else if ($scope.communityId == null || $scope.communityId == "" || angular.isUndefined($scope.communityId)) {
          commonService.showNoticeMessage('请选择小区！');
        } else {
          //规格
          var idStrs = '';
          var tag = false;
          var guige_1 = '';
          var guige_2 = '';
          $('select').each(function (index, data) {
            if (index > 0) {
              if (index % 2 == 0) {
                idStrs += ',';
              }
              if ($(this).val() == '') tag = true;
              idStrs += $(this).attr('selected', 'selected').val();
              if (index == 1) guige_1 = $(this).prev().text() + $(this).find('option:selected').text().trim();
              else guige_2 = $(this).prev().text() + $(this).find('option:selected').text().trim();
            }
          });
          //调用下单购买接口
          var goodsToBuy = [];
          var cartParams = {
            "goods_id": localStorage.goodsId,
            "count": $scope.count,
            "guige": idStrs,
            "guige_1": guige_1,
            "guige_2": guige_2,
            "delivery_id": $scope.selected,
            "service_station_id": $scope.stationId,
            "contact_name": $scope.username,
            "contact_phone": $scope.telphone,
            "community_id": $scope.communityId,
            "number": $scope.number,
            "remark": $scope.remark
          };
          if (localStorage.target != null && localStorage.target == 'article' || localStorage.target == 'ad') {
            cartParams.target = localStorage.target;
            localStorage.removeItem('target');
          }
          var cart_id = null;
          if (localStorage.skip != null) cart_id = localStorage.skip.split(':')[2];
          if (cart_id != null) cartParams.cart_id = cart_id;
          goodsToBuy.push(cartParams);
          var params = {"mobile": localStorage.mobile, "goods": goodsToBuy};
          userService.postRequestWithUrlAndParams("buy.action", {json: JSON.stringify(params)}).success(function (response) {

            if (response.code == '0') {
              var orderNo = response.data;
              payCacheService.setProperty("orderId", orderNo);
              sessionStorage.isFrom = 3;
              $state.go('guanjia-pay', {
                from: 3,
                obj: {
                  orderIds: orderNo
                }
              });
            } else {
              commonService.showErrorMessage(response.data);
            }


          });
        }
      }
      /************************************** end ******************************************/

    }
);

/**
 * 商品详情数据
 */
serviceModuleController.controller(
    'goodsDetailCtrl',
    function ($scope, $stateParams, $rootScope, guanjiaService, userService, $state, commonService, $interval, $cookies, $sce, $q, $location) {
      /*********************************** 自定义函数 ***************************************/
      if ($stateParams.goods_id != null) {
        localStorage.goodsId = $stateParams.goods_id;
      }
      $scope.imgShow = false; //标志轮播图数据还未加载
      //路由的方式，是为了通过二维码扫描能进入详情页，本地存储是为了页面间切换保留商品ID
      var loginDetail; //通过二维码扫描能进入详情页
      loginDetail = $location.search().loginDetail;
      if (loginDetail != undefined) {
        $scope.goodId = $location.search().id;
        localStorage.goodsId = $scope.goodId;
        $scope.loginDetailHide = true;
      }

      if ($stateParams.target != null) localStorage.target = $stateParams.target;
      //卡头切换
      $scope.showType = '1';
      $scope.detailTab = function ($event, type) {
        $scope.errMsg = '';
        $('.good-common').removeClass('tab-active');
        $($event.target).addClass('tab-active');
        $scope.showType = type;
        if (type == '2') {
          getGoodsCount();
        } else if (type == '3') {
          getGoodsComment();
        }
      };

      //调用商品详情接口
      $scope.errMsg = '';
      guanjiaService.goodsDetail({'goods_id': localStorage.goodsId}).success(function (data) {
        //商品开卖倒计时
        $scope.countdown = data.data.now_date;
        if ($scope.countdown != '') {
          var time = Math.floor($scope.countdown / 1000);
          showTime = $interval(function () {
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

        switch (data.code) {
          case '0':
            $scope.goods = data.data;
            $scope.goodsDetailDescription = $sce.trustAsHtml($scope.goods.description);
            if ($scope.goodsDetailDescription) {
              $scope.errMsg = '';
            } else if (!$scope.goodsDetailDescription) {
              $scope.errMsg = '没有相关数据！';
            }
            var priceR = $scope.goods.priceRange;
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


            $scope.slides = $scope.goods.goods_images;
            $scope.myInterval = parseInt($rootScope.shuffling) * 1000;
            //if ($scope.slides != '') {
            //轮播图请求到数据1秒后显示
            //setTimeout(function () {
            //  $scope.imgShow = false;
            //}, 1000);
            //}
            if ($scope.slides.length > 0) {
              $scope.imgShow = true;//true:标志轮播图数据加载完成
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


      //评价
      function getGoodsComment() {
        guanjiaService.listGoodsComment({'goods_id': localStorage.goodsId}).success(function (data) {

          switch (data.code) {
            case '0':
              if (data.data != '') {

                $scope.errMsg = '';
                //评价星星图
                $scope.evaluateList = data.data;
                for (var i = 0; i < $scope.evaluateList.length; i++) {
                  $scope.evaluateList[i].lightstarimgObj = '';
                  $scope.evaluateList[i].starimgObj = '';
                  for (var j = 0; j < $scope.evaluateList[i].star; j++) {//实心星星
                    var img = '<img src="images/lightstar.png">';
                    $scope.evaluateList[i].lightstarimgObj += img;
                  }
                  for (var z = 0; z < 5 - $scope.evaluateList[i].star; z++) {//空心星星
                    var img = '<img src="images/star.png">';
                    $scope.evaluateList[i].starimgObj += img;
                  }
                }
              } else {
                $scope.errMsg = '没有相关数据！';
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
      }


      //销量数据
      function getGoodsCount() {
        guanjiaService.getGoodsCount({
          goods_id: localStorage.goodsId
        }).success(function (response) {

          switch (response.code) {
            case '0':
              if (response.data != '') {

                $scope.errMsg = '';
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
                $scope.errMsg = '没有相关数据！';
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
      }

      /************************************** end ******************************************/

      /*********************************** 页面事件监听 *************************************/
      //返回商品列表
      $scope.backtogoodslist = function () {

        //返回上一页的时候清除id（这里需要传id只在从购物车和订单中）
        localStorage.removeItem('goodsDetailFromId');

        if (localStorage.goodsDetailFrom == '%goodsList%') {
          localStorage.skip = 'detail';
          $state.go('guanjia-goodslist');
        }
        else if (localStorage.goodsDetailFrom == '%guanggao%') {
          $state.go(localStorage.adRoute);
        }

        else if (localStorage.goodsDetailFrom == '%cartList%') {
          var temp = localStorage.skip.split(':')[0];
          $state.go('member-user-cart', {from: temp});
        }
        else if (localStorage.goodsDetailFrom == '%orderList%') {
          localStorage.skip = 'orderList';
          $state.go('member-user-myorder');
        }
        else if (localStorage.goodsDetailFrom == '%orderDetail%') {
          localStorage.skip = 'detailList';
          $state.go('member-user-orderdetail');
        }
        else if (localStorage.goodsDetailFrom == '%reserveList%') {
          $state.go('member-user-reserve');
        }
        else if (localStorage.goodsDetailFrom == "%couponsSeller%") {
          $state.go('guanjia-goodslist');
        }
      };
      //进入购买页
      $scope.jumppurchase = function () {
        if ($scope.goods.inventory == 0) {
          commonService.showWarnMessage("商品库存为0，不能购买！");
        } else {
          localStorage.toPurchase = 111;
          sessionStorage.station_id = "";
          sessionStorage.removeItem('isSelectedMyCommunity');//是否选择我的小区标识符
          $state.go('service-purchase', {
                operate: 111,
                obj: {}
              }
          );
          $cookies.put('tab', '?detail%')
        }

      };


    }
    /************************************** end ******************************************/
);


serviceModuleController.controller(
    'selectStationCtrl',
    function ($scope, $stateParams, guanjiaService, $rootScope, userService, $state, $cookies, reserveCacheService) {
      $scope.gpscityName = sessionStorage.gpscityName;

      /*
       *
       * from = 1 ,从购买页选择服务站
       * from = 2 ,从服务预约页选择服务站
       *
       */
      var from = localStorage.selectStationFrom;
      var params = $stateParams.obj;

      //获取服务站数据
      $scope.stationParams = {
        city_id: sessionStorage.gpscityId,
        key: '',
        goods_id: localStorage.goodsId
      };
      $scope.errMsg = '';
      function getStation(params) {
        guanjiaService.listStation(params).success(function (response) {
          if (response.code == '0') {
            if (response.data.length > 0) {
              $scope.errMsg = '';
              $scope.station = response.data;
              //数据请求完毕后重新进行排序
              $.getScript('scripts/common/selectcity/sort.js', function () {
                startSorts();
              });
            } else {
              $scope.errMsg = '没有相关数据';
            }
          }
        });
      };

      getStation($scope.stationParams);
      /******************关键字搜索****************************/
      $scope.stationSearch = function () {
        $scope.stationParams.key = $('.search-input').val();
        getStation($scope.stationParams);
      };
      //失去焦点，获取key的值
      $scope.stationBlur = function () {
        $scope.stationParams.key = $('.search-input').val();
      };

      $scope.back = function () {
        if (from == 1) {
          $state.go('service-purchase', {"operate": "2", obj: params});
        }
        if (from == 2) {
          localStorage.backReserve = 1;
          $state.go('guanjia-servicereserve');
        }

      }


      //服务站选择完成
      $scope.jumppurchase = function (stationModel) {



        //上传用户选择的服务站,选择成功后回去
        var params = {
          "service_station_id": stationModel.service_station_id,
          "xingqi_guige_id": "",
          "user_community_id": "",
          "date": "",
          "ticket": $cookies.get("ticket")
        }
        userService.postRequestWithUrlAndParams("saveMySelect.action", params).success(function (response) {

          if (from == 1) {

            var purchaseStr = localStorage.resPurchaseInfo;
            var purchase = JSON.parse(purchaseStr);

            purchase.stationId = stationModel.service_station_id;
            purchase.stationName = stationModel.name;
            sessionStorage.selectedServiceStationId = stationModel.service_station_id; //该字段用以给购买页获取服务站对应的商品的价格以及库存
            //当已经选择了小区那么在选择服务站的时候不自动填写小区，否则就自动填写
            if (purchase.userCommunityId == "" || purchase.userCommunityId == undefined || purchase.userCommunityId == null) {
              purchase.communityName = stationModel.community_name;
              purchase.communityId = stationModel.community_id;
            }

            //返回购买页之前用sessionStorage将要传递回去的参数存起来
            var paramsStr = JSON.stringify(purchase);
            localStorage.resPurchaseInfo = paramsStr
            localStorage.toPurchase = 2;

            $state.go('service-purchase', {"operate": "2", obj: params});
          }
          if (from == 2) {
            //该字段用以给购买页获取服务站对应的商品的价格以及库存
            sessionStorage.selectedServiceStationId = stationModel.service_station_id; //该字段用以给购买页获取服务站对应的商品的价格以及库存
            reserveCacheService.setProperty('stationName', stationModel.name);
            reserveCacheService.setProperty('stationId', stationModel.service_station_id);
            localStorage.backReserve = 1;
            $state.go('guanjia-servicereserve');
          }
        });


      }
      //跳到站点详情页
      $scope.jumpStationDetail = function (station_id) {
        $state.go('member-about-stationdetail', {'station_id': station_id});
      }

    }
);


//我的小区选择
serviceModuleController.controller(
    'mycommunityselectCtrl',
    function ($scope, $stateParams, userService, $state, commonService, $q, $location, $cookies, reserveCacheService) {

      /*
       *  operate = 3 从商品购买页跳转来
       *  operate = 6 从服务预约页跳转来
       */
      var operate = $stateParams.operate;
      var params = $stateParams.obj;


      $scope.params = {
        "mobile": localStorage.mobile,
        "city_id": sessionStorage.gpscityId,
        'pageno': '1', //页码
        'pagesize': '10', //页数
        "url": 'listUserCommunity.action',
        "direction": 'up',
        "key": ''
      };
      if (!$scope.params.mobile) {
        $state.go('member-personal-login');
        sessionStorage.loginLocation = $location.path();
      }
      var isOver = false; //false:标志数据未加载完成
      $scope.errMsg = '';
      $scope.myCommunityList = [];
      $scope.CommunityFun = function (params) {
        var defer = $q.defer();
        userService.postRequestWithPageNo(params).success(function (response) {
          switch (response.code) {
            case '0':
              if (response.data.length == 0 && params.pageno == '1') {
                $scope.errMsg = '没有相关数据';
              } else {
                $scope.errMsg = '';
                var tempList = response.data;
                if (tempList.length < params.pagesize) {
                  isOver = true;//true:标志数据加载完成
                  defer.resolve(isOver);
                } else {
                  isOver = false;
                  defer.resolve(isOver);
                }
                if (params.direction == 'down') {
                  $scope.myCommunityList = response.data;
                } else {
                  $scope.myCommunityList = $scope.myCommunityList.concat(tempList);
                }
                localStorage.myCommunitys = $scope.myCommunityList.length || 0;
              }
              commonService.hiddenWeUILoadingHub();
              break;
            case '-8':
              $state.go('member-personal-login');
              sessionStorage.loginLocation = $location.path();
              break;

          }
        }).error(function (data, status, header, config) {

        });
        return defer.promise;
      };
      $scope.CommunityFun($scope.params);

      /*************关键字搜索*******************/
      $scope.CommunityList = [];
      $scope.searchCom = function () {
        $scope.myCommunityList = [];
        $scope.params.pageno = '1';
        $scope.params.key = $('.search-input').val();
        $scope.CommunityFun($scope.params);
      };


      $scope.goToback = function () {
        //返回购买页之前用sessionStorage将要传递回去的参数存起来
        //var paramsStr = JSON.stringify(params);
        //localStorage.resPurchaseInfo = paramsStr


        if (operate == 3) {
          $state.go('service-purchase', {"operate": "3", obj: {}});
        }

        if (operate == 6) {
          $state.go('guanjia-servicereserve', {
            operate: 2,
            obj: {}
          })
        }
      }


      //获取当前城市名称,然后显示
      $scope.currentCityName = sessionStorage.gpscityName;


      //拨打电话
      $scope.dailMobile = function (mobile) {
        event.stopPropagation();
        window.location.href = "tel:" + mobile;
      }

      //选择小区完成后
      $scope.didSelectedCommunity = function (communityModel) {


        var community = communityModel.community; //小区名称
        var userCommunityId = communityModel.userCommunity_id; // 我的小区id
        var communityId = communityModel.community_id;
        var username = communityModel.username;  //联系人姓名
        var number = communityModel.number;    //楼号
        var telphone = communityModel.telphone;  //联系人的电话

        if (operate == 3 || localStorage.toMyCommunitySelect == 3) {

          var purchaseStr = localStorage.resPurchaseInfo;
          var purchase = JSON.parse(purchaseStr);

          purchase.communityName = community;
          purchase.communityId = communityId;
          purchase.userName = username;
          purchase.telphone = telphone;
          purchase.number = number;
          purchase.userCommunityId = userCommunityId;

          //返回购买页之前用sessionStorage将要传递回去的参数存起来
          var paramsStr = JSON.stringify(purchase);
          localStorage.resPurchaseInfo = paramsStr;

          localStorage.toPurchase = 3;
          //标识符，用以判断是否选择了我的小区，如果已经选择了我的小区那么在选择服务站的时候不会再去自动填充小区数据
          sessionStorage.isSelectedMyCommunity = 1

          //上传用户选择的小区，选择小区完成后回去
          var params = {
            "service_station_id": "",
            "xingqi_guige_id": "",
            "user_community_id": communityModel.userCommunity_id,
            "date": "",
            "ticket": $cookies.get("ticket")
          }
          userService.postRequestWithUrlAndParams("saveMySelect.action", params).success(function (response) {
            $state.go('service-purchase', {"operate": "3", obj: params});
          });


        }
        if (operate == 6 || localStorage.toMyCommunitySelect == 6) {

          //上传用户选择的小区，选择小区完成后回去
          var params = {
            "service_station_id": "",
            "xingqi_guige_id": "",
            "user_community_id": communityModel.userCommunity_id,
            "date": "",
            "ticket": $cookies.get("ticket")
          }
          userService.postRequestWithUrlAndParams("saveMySelect.action", params).success(function (response) {

            reserveCacheService.setProperty("community", community);
            reserveCacheService.setProperty("communityId", communityId);
            reserveCacheService.setProperty("userName", username);
            reserveCacheService.setProperty("floor", number);
            reserveCacheService.setProperty("telephone", telphone);

            $state.go('guanjia-servicereserve', {
              operate: 2,
              obj: params
            });
          });


        }


      }

    }
);


serviceModuleController.controller(
    'goodsPreviewCtrl',
    function ($scope, $stateParams, $rootScope, guanjiaService, userService, $state, commonService, $interval) {
      $scope.goodsId = $stateParams.id;
      guanjiaService.goodsDetail({'goods_id': $scope.goodsId}).success(function (data) {

        //$(".seller-name").text(data.data.name);
        //商品开卖倒计时
        $scope.countdown = data.data.now_date;
        if ($scope.countdown != '') {
          var time = Math.floor($scope.countdown / 1000);
          var showTime = $interval(function () {

            if (time <= 1) {
              $interval.cancel(showTime);
              $scope.showTimeHtml = '已开卖,抓紧时间抢购哦！';
            } else {
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
        }
        else {
          $('.count_down').css({
            'height': '2px'
          })
        }
        switch (data.code) {
          case '0':
            $scope.goods = data.data;
            break;
          case '-1':
            console.log('参数为空');
            break;
          case '-2':
            console.log('参数错误');
            break;
        }

      });

    }
);

/** （此项目可以说很难维护了）
 * 尝试最新写法，模仿vue2，逻辑结构清晰
 * data 数据
 * methods 函数
 * created 加载时操作
 */
serviceModuleController.controller('payCompletionCtrl', function ($scope, $state, $location, $http,
                                                                  $cookies, commonService) {
  $scope.data = {
    toUrl: '',
    payNo: '',
    payment: [],
    total: 0,
    goodsIds: ''
  };
  $scope.methods = {
    /**
     * 获取当前URL中的参数
     */
    getUrlParams: function () {
      //为了简化操作，用_this来操作$scope.data
      var _this = $scope.data;
      var url = $location.$$url;
      //分割#后的数组
      var params = url.substr(url.indexOf('?') + 1).split('#');
      if (params.length == 2) {
        _this.toUrl = params[0].substr(params[0].indexOf('=') + 1);
        _this.payNo = params[1].substr(params[1].indexOf('=') + 1);
      }
    },
    /**
     * 获取支付单信息
     */
    getPayListInfo: function () {
      var _this = $scope.data;
      $http.post(commonService.getBaseParams().url + 'getOrderPayment.action',
          {ticket: $cookies.get('ticket'), payNo: _this.payNo})
          .success(function (resp) {
            switch (resp.code) {
              case '0':
                var temp = resp.data;
                _this.goodsIds = temp.goodsIds;
                _this.payment = temp.payment;
                _this.total = temp.total;
                break;
              case '-1':
                //可在拦截器里对错误做统一处理
                console.log('参数为空');
                break;
              case '-2':
                console.log('参数错误');
                break;
              case '-3':
                console.log(resp.data);
                commonService.showErrorMessage(resp.data);
                break;
            }
          });
    },
    shareOrder: function () {
      $state.go('service-share', {
        goodsIds: $scope.data.goodsIds
      });
    },
    backOther: function () {
      var toUrl = $scope.data.toUrl;
      if (toUrl == 'cart') {
        $state.go('member-user-cart', {from: 0});
      } else if (toUrl == 'order') {
        localStorage.skip = 'orderList';
        $state.go('member-user-myorder');
      } else if (toUrl == 'reserve') {
        $state.go('member-user-reserve');
      } else {
        $state.go('guanjia-goodslist');
      }
    }
  };
  $scope.created = function () {
    $scope.methods.getUrlParams();
    $scope.methods.getPayListInfo();
  };
  $scope.created();
});

/**（此项目可以说很难维护了）
 * 尝试最新写法，模仿vue2，逻辑结构清晰
 * data 数据
 * methods 函数对象
 * created() 加载时操作
 */
serviceModuleController.controller('shareGoodsCtrl', function ($scope, $state, $stateParams, commonService, $http, $cookies) {
  $scope.data = {
    //首次进来显示分享提示
    intiShare: true,
    goodsList: []
  };
  $scope.methods = {
    getGoodsList: function () {
      var _this = $scope.data;
      var goodsIds = $stateParams.goodsIds;
      $http.get(commonService.getBaseParams().url + 'listGoods.action', {
        params: {
          goodsIds: goodsIds,
          share: 'true'
        }
      })
          .success(function (resp) {
            switch (resp.code) {
              case '0':
                _this.goodsList = resp.data.goods;
                break;
              case '-1':
                console.log('参数为空');
                break;
              case '-2':
                console.log('参数错误');
                break;
            }
          });
    },
    goGoodsDetail: function (type, goodsId, business_id) {
      $cookies.put('businessId', business_id);
      if (type == '特供服务') {
        $cookies.put('from', '%tegong%');
        localStorage.goodsDetailFrom = '%goodsList%';
        localStorage.goodsId = goodsId;
        $state.go('service-goodsDetail', {goods_id: localStorage.goodsId});
      } else if (type == '家庭服务') {
        $state.go('guanjia-familyservicedetail', {
          goodsId: goodsId
        });
      } else if (type == '商家福利') {
        localStorage.goodsId = goodsId;
        $cookies.put('from', '%fuli%');
        $state.go('service-goodsDetail', {goods_id: localStorage.goodsId});
      }
    },
    closePrompt: function () {
      var _this = $scope.data;
      _this.intiShare = false;
      $('.share-templates').css({
        'height': 'auto',
        'background': '#f8f8f8'
      });
    }
  };
  $scope.created = function () {
    $scope.methods.getGoodsList();
  };
  $scope.created();
});