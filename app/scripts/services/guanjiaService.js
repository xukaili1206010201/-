'use strict';

var guanjiaService = angular.module('guanjiaService', []);

guanjiaService.factory('guanjiaService', function ($http, commonService, $q, $cookies) {

  var service = { // our factory definition

    businessDetail: function (params) {
      var url = commonService.getBaseParams().url + 'getBusiness.action';
      return $http.post(url, params);
    },

    listBusiness: function (params) {
      var url = commonService.getBaseParams().url + 'listBusiness.action';
      return $http.post(url, params);
    },
    listgoods: function (params) {
      var url = commonService.getBaseParams().url + 'listGoods.action';
      return $http.post(url, params);
    },
    goodsDetail: function (params) {
      var url = commonService.getBaseParams().url + 'getGoods.action';
      return $http.post(url, params);
    },
    purchase: function (params) {
      var url = commonService.getBaseParams().url + 'buy.action';
      return $http.post(url, params);
    },
    listGoodsComment: function (params) {
      var url = commonService.getBaseParams().url + 'listGoodsComment.action';
      return $http.post(url, params);
    },
    addcart: function (params) {
      var url = commonService.getBaseParams().url + 'addCart.action';
      return $http.post(url, params);
    },
    listad: function (params) {
      var url = commonService.getBaseParams().url + 'listAd.action';
      return $http.post(url, params);
    },
    listNotice: function (params) {
      var url = commonService.getBaseParams().url + 'listNotice.action';
      return $http.post(url, params);
    },
    listDelivery: function (params) {
      var url = commonService.getBaseParams().url + 'listDelivery.action';
      return $http.post(url, params);
    },
    listMarket: function () {
      var url = commonService.getBaseParams().url + 'listMarket.action';
      return $http.post(url);
    },
    recordMarket: function (params) {
      var url = commonService.getBaseParams().url + 'addMarketDetail.action';
      return $http.post(url, params);
    },

    count: function (params) {
      var url = commonService.getBaseParams().url + 'count.action';
      return $http.post(url, params);
    },
    listCityService: function (params) {
      var url = commonService.getBaseParams().url + 'listCityService.action';
      return $http.post(url, params);
    },
    listStation: function (params) {
      var url = commonService.getBaseParams().url + 'listServiceStation.action';
      return $http.post(url, params);
    },
    listCategory: function (params) {
      var url = commonService.getBaseParams().url + 'listCategory.action';
      return $http.post(url, params);
    },
    //商品销量
    getGoodsCount: function (params) {
      var url = commonService.getBaseParams().url + 'getGoodsCount.action';
      return $http.post(url, params);
    },

    //定位
    gpsCity: function (params) {
      var url = commonService.getBaseParams().url + 'gpsCity.action';
      return $http.post(url, params);
    },
    //更改规格查询对应价格
    getPriceAndInventory: function (params) {
      var url = commonService.getBaseParams().url + 'getPriceAndInventory.action';
      return $http.post(url, params);
    },

    //活动召集列表
    listActivity: function (params) {
      var url = commonService.getBaseParams().url + 'listActivity.action';
      return $http.post(url, params);
    },

    //活动召集详情
    getActivity: function (params) {
      var url = commonService.getBaseParams().url + 'getActivity.action';
      return $http.post(url, params);
    },


    //活动报名
    activityApply: function (params) {
      var url = commonService.getBaseParams().url + 'activityApply.action';
      return $http.post(url, params);
    },
    listGovernmentInfo: function (params) {
      var url = commonService.getBaseParams().url + 'getGovernmentInfo.action';
      return $http.post(url, params);
    },

    //获取系统和城市的广告
    getAdverts: function (label) {
      var defer = $q.defer();
      var url = commonService.getBaseParams().url + 'listAd.action';
      $http.post(url, {type: 'system,city', city_id: sessionStorage.gpscityId, label: label}).success(function (data) {
        var slides = data.data;
        //for (var i = 0; i < data.data.length; i++) {
        //  var src = data.data[i].imageUrl;
        //  slides.push({image: src, text: data.data[i].name});
        //}
        defer.resolve(slides);

        var buttonArray = $(".carousel-ad-images").find(".carousel-control");
        for (var index = 0; index < buttonArray.length; index++) {
          var className = buttonArray[index];
          $(className).css({
            'display': 'none'
          });
        }
      });
      return defer.promise;
    },
    //获取公告信息
    getNotice: function (params) {
      var defer = $q.defer();
      var url = commonService.getBaseParams().url + 'listNotice.action';
      $http.post(url, params).success(function (response) {
        if (response.code == '0') {
          $.getScript('scripts/common/plugins/marquee.js', function () {
            createMarquee();
          });
          defer.resolve(response.data);
        } else {
          console.log('获取公告信息有误！guanjiaService->getNotice');
        }

      });
      return defer.promise;
    },

    /**
     * 获取城市服务的提示信息
     */
    getCityServicePrompt: function (params) {
      var url = commonService.getBaseParams().url + 'getCityService.action';
      return $http.post(url, params);
    },

    //城市定位
    usercitySelect: function () {
      var defer = $q.defer();
      //**************************** 百度API ****************************
      //报错
      function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            //alert("定位失败,用户拒绝请求地理定位");
            break;
          case error.POSITION_UNAVAILABLE:
            //alert("定位失败,位置信息是不可用");
            break;
          case error.TIMEOUT:
            alert("定位失败,请求获取用户位置超时");
            break;
          case error.UNKNOWN_ERROR:
            alert("定位失败,定位系统失效");
            break;
        }
        //commonService.showWarnMessage("请选择城市!");
        //$rootScope.jump='Selectcity';
        //$state.go('member-user-selectcity')
      }

      //成功
      function showPosition(position) {
        //经纬度
        lat = position.coords.latitude;
        lag = position.coords.longitude;
        latlon = lat + ',' + lag;

        //baidu
        var url = "http://api.map.baidu.com/geocoder/v2/?ak=C93b5178d7a8ebdb830b9b557abce78b&callback=renderReverse&location=" + latlon + "&output=json&pois=0";
        $.ajax({
          type: "GET",
          dataType: "jsonp",
          url: url,
          beforeSend: function () {
            $("#position").html('正在定位...');
          },
          success: function (json) {
            if (json.status == 0) {
              cityResult = json.result.formatted_address;
              $("#position").html(cityResult);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#position").html(latlon + "地址位置获取失败");
          }
        });
        sessionStorage.lat = lat;
        sessionStorage.lag = lag;
        sessionStorage.cityResult = cityResult;
      }

      if (navigator.geolocation) {
        var lat, lag, latlon, cityResult;

        navigator.geolocation.getCurrentPosition(showPosition, showError);

        //请求定位接口
        var url = commonService.getBaseParams().url + 'gpsCity.action';
        var params = {
          ticket: $cookies.get('ticket'),
          mobile: localStorage.mobile,
          address: sessionStorage.cityResult,
          longitude: sessionStorage.lag,
          latitude: sessionStorage.lat
        };

        $http.post(url, params).success(function (data) {
          if (data.code == '0') {
            var result = data.data;
            defer.resolve(result);

          } else {
            console.log('错误')
          }

        });


      } else {
        alert("浏览器不支持地理定位。");
      }


      return defer.promise;
    }

  };
  return service;

});
