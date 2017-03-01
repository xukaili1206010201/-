'use strict';

var appDirective = angular.module('appDirective', []);

//触摸指令 触摸
appDirective.directive('ngTouchstart', [function () {
  return function (scope, element, attr) {
    element.on('touchstart', function (event) {
      scope.$apply(function () {
        scope.$eval(attr.ngTouchstart);
      });
    });
  };
}]);

//触摸指令 松开
appDirective.directive('ngTouchend', [function () {
  return function (scope, element, attr) {
    element.on('touchend', function (event) {
      scope.$apply(function () {
        scope.$eval(attr.ngTouchend);
      });
    });
  };
}]);

/**
 * 认证指令，处理成功|失败的提示信息
 */
appDirective.directive('login',
    function ($location, $state, commonService, AUTH_EVENTS) {
      return {
        restrict: 'A',
        link: function ($scope, elem, attr) {
          var loginSuccess = function () {
            //commonService.openOperateModel(null, null, '', {});//跳转到登录成功页
          };

          var loginFailed = function () {
            //commonService.openOperateModel(null, null, '', {});
          };

          $scope.$on(AUTH_EVENTS.loginSuccess, loginSuccess);//登录成功
          $scope.$on(AUTH_EVENTS.loginFailed, loginFailed);//登录失败
        }
      };
    })

/**
 * 认证权限信息指令，处理页面权限的提示信息
 */
appDirective.directive('authInfo',
    function ($location, $state, commonService, AUTH_EVENTS) {
      return {
        restrict: 'A',
        link: function ($scope) {

          if ($location.$$path == '/service/share.htm') {
            $(document).attr("title", "我在乐生活平台的订单，必须炫耀一下~");
          } else $(document).attr("title", "乐生活--智慧社区");
          var notAuthenticatedInfo = function () {
            console.log('not Authenticated');
            //commonService.openOperateModel(null, null, '', {});
          };

          var notAuthorizedInfo = function () {
            console.log('not Authorized');
            //commonService.openOperateModel(null, null, '', {});
          };

          var sessionTimeoutInfo = function () {
            console.log('session timeout');
            //commonService.openOperateModel(null, null, '', {});
          };

          $scope.$on(AUTH_EVENTS.notAuthenticated, notAuthenticatedInfo);//没有认证
          $scope.$on(AUTH_EVENTS.notAuthorized, notAuthorizedInfo);//没有授权
          $scope.$on(AUTH_EVENTS.sessionTimeout, sessionTimeoutInfo)//登录超时
        }
      };
    });

//播放指令-播放
appDirective.directive("ngPlay", ["$timeout", "$interval", function (timer, $interval) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {
        var playWay = attr.playWay;//音频播放方式

        elem.on('click', function () {
          var src = attr.ngPlay;//音频来源
          var playSrc = elem.attr('play-src');//新的音频来源

          if (playSrc != null && typeof(playSrc) != 'undefined') {
            src = playSrc;
          }

          var audio = null;
          if (!(elem.find('audio').length > 0 )) {//第一次创建
            elem.append('<audio src="' + src + '"></audio>');
            audio = elem.find('audio').get(0);//坑点
          } else {//已经存在时判断
            audio = elem.find('audio').get(0);
            if ($(audio).attr('src') != src) {//新来源时重建,否在还是同样的audio
              elem.find('audio').remove();
              elem.append('<audio src="' + src + '"></audio>');
              audio = elem.find('audio').get(0);
            }
          }

          $scope.timePromise = $interval(function () {//开始计时
            if (audio.ended) {
              elem.find('.audio-icon').css({
                'background-image': "url('http://wx.dfzhgx.com/images/audio-icon.png')"
              });
              $interval.cancel($scope.timePromise);
            }
          }, 10);

          if (audio.paused) {
            elem.find('.audio-icon').css({
              'background-image': "url('http://wx.dfzhgx.com/images/audio-icon.gif')"
            });
            audio.play();
            return;
          } else if (audio.play) {
            elem.find('.audio-icon').css({
              'background-image': "url('http://wx.dfzhgx.com/images/audio-icon.png')"
            });
            audio.pause();
          }


        });

      }, 0);
    }
  };
}]);


//选择指令-选择
appDirective.directive("customSelect", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {

        elem.on('click', function () {

          if (elem.find('.audio-edit').attr('class').indexOf('selected') < 0) {
            $('.audio-edit').removeClass('selected');
            elem.find('.audio-edit').addClass('selected');
          } else {
            elem.find('.audio-edit').removeClass('selected');
          }

        });

      }, 0);
    }
  };
}]);

//选择指令-开关
appDirective.directive("bootstrapSwitch", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {

        elem.bootstrapSwitch();
        elem.bootstrapSwitch().setOnLabel('男');
        elem.bootstrapSwitch().setOffLabel('女');

      }, 0);
    }
  };
}]);


//滑动
appDirective.directive("customSlide", ["$timeout", "$state", function (timer, $state) {
  return {
    restrict: "EA",
    link: function ($scope, elem, attr) {
      timer(function () {

        var initX;
        var moveX;
        var X = 0;
        var objX = 0;

        //需要左划的li
        var rowName = "list-group-item";
        var deleteButtonW = 80;
        var obj;
        var targetObj;

        window.addEventListener('touchstart', function (event) {
          event.preventDefault();
          targetObj = event.target.nodeName;

          if (event.target.className == "glyphicon glyphicon-edit") {
            //$('#Modal').modal('show');
            $state.go('member-personal-passwordreset');
          } else if (event.target.className == 'btn btn-danger') {
            $('#Modal').modal('hide');
          } else {
            switch (targetObj) {
              case 'DIV':
                obj = event.target.parentNode;
                break;
              case 'LI':
                obj = event.target.parentNode.parentNode.parentNode.parentNode;
                break;
            }
          }

          //if(event.target.className=="payout btn-success"){
          //   var removeNode=event.target.parentNode.parentNode;
          //  removeNode.remove();
          //}

          if (obj.className == rowName) {
            initX = event.targetTouches[0].pageX;
            objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
          }
          if (objX == 0) {
            window.addEventListener('touchmove', function (event) {
              event.preventDefault();
              if (obj.className == rowName) {
                moveX = event.targetTouches[0].pageX;
                X = moveX - initX;
                if (X > 0) {
                  obj.style.WebkitTransform = "translateX(" + 0 + "px)";
                }
                else if (X < 0) {
                  var l = Math.abs(X);
                  obj.style.WebkitTransform = "translateX(" + -l + "px)";
                  if (l > deleteButtonW) {
                    l = deleteButtonW;
                    obj.style.WebkitTransform = "translateX(" + -l + "px)";
                  }
                }
              }
            });
          }
          else if (objX < 0) {
            window.addEventListener('touchmove', function (event) {
              event.preventDefault();
              if (obj.className == rowName) {
                moveX = event.targetTouches[0].pageX;
                X = moveX - initX;
                if (X > 0) {
                  var r = -deleteButtonW + Math.abs(X);
                  obj.style.WebkitTransform = "translateX(" + r + "px)";
                  if (r > 0) {
                    r = 0;
                    obj.style.WebkitTransform = "translateX(" + r + "px)";
                  }
                }
                else {     //向左滑动
                  obj.style.WebkitTransform = "translateX(" + -deleteButtonW + "px)";
                }
              }
            });
          }

        })
        window.addEventListener('touchend', function (event) {
          event.preventDefault();
          if (obj.className == rowName) {
            objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
            if (objX > -40) {
              obj.style.WebkitTransform = "translateX(" + 0 + "px)";
            } else {
              obj.style.WebkitTransform = "translateX(" + -80 + "px)";
            }
          }
        })


      });
    }
  };
}]);

//图表
//appDirective.directive("customEchart", ["$timeout", function (timer) {
//  return {
//    restrict: "EA",
//    link: function ($scope, elem, attr) {
//      timer(function () {
//
//
//
//          var dom1 = document.getElementById("echarts1");
//          var myChart1 = echarts.init(dom1);
//          var dom2 = document.getElementById("echarts2");
//          var myChart2 = echarts.init(dom2);
//          var app = {};
//           var option1 = null;
//          option1 = {
//            tooltip: {
//              trigger: 'axis'
//            },
//            legend: {
//              y:'20',
//              data:['早餐','晚餐','特供品'],
//            },
//            grid: {
//              left: '3%',
//              right: '4%',
//              bottom: '3%',
//              containLabel: true
//            },
////      toolbox: {
////        feature: {
////          saveAsImage: {}
////        }
////      },
//            xAxis: {
//              type: 'category',
//              boundaryGap: false,
//              data: ['周一','周二','周三','周四','周五','周六','周日']
//            },
//            yAxis: {
//              type: 'value'
//            },
//            series: [
//              {
//                name:'早餐',
//                type:'line',
//                stack: '总量',
//                data:[120, 132, 101, 134, 90, 230, 210]
//              },
//              {
//                name:'晚餐',
//                type:'line',
//                stack: '总量',
//                data:[220, 182, 191, 234, 290, 330, 310]
//              },
//              {
//                name:'特供品',
//                type:'line',
//                stack: '总量',
//                data:[150, 232, 201, 154, 190, 330, 410]
//              }
//            ]
//          };
//
//          var option2 = null;
//          option2 = {
//            tooltip: {
//              trigger: 'axis'
//            },
//          legend: {
//            y:'20',
//            data:['邮件营销','联盟广告','视频广告']
//          },
//            grid: {
//              left: '3%',
//              right: '4%',
//              bottom: '3%',
//              containLabel: true
//            },
////      toolbox: {
////        feature: {
////          saveAsImage: {}
////        }
////      },
//            xAxis: {
//              type: 'category',
//              boundaryGap: false,
//              data: ['周日','周二','周三','周四','周五','周六','周一']
//            },
//            yAxis: {
//              type: 'value'
//            },
//            series: [
//              {
//                name:'邮件营销',
//                type:'line',
//                stack: '总量',
//                data:[120, 132, 101, 134, 90, 230, 210]
//              },
//              {
//                name:'联盟广告',
//                type:'line',
//                stack: '总量',
//                data:[220, 182, 191, 234, 290, 330, 310]
//              }
//            ]
//          };
//
//          if (option1 && typeof option1 === "object"&&option2 && typeof option2 === "object") {
//            var startTime = +new Date();
//            myChart1.setOption(option1, true);
//            myChart2.setOption(option2, true);
//            var endTime = +new Date();
//            var updateTime = endTime - startTime;
//
//
//            $('#echarts2').parent().css({'display': 'none'});
//
//            $("li[role='presentation']:eq(1)").on('click', function() {
//              $('#echarts2').parent().css({'display': 'block'});
//              $('#echarts1').parent().css({'display': 'none'})
//            });
//            $("li[role='presentation']:eq(0)").on('click', function() {
//              $('#echarts2').parent().css({'display': 'none'});
//              $('#echarts1').parent().css({'display': 'block'});
//            });
//
//          }
//
//
//
//
//
//      });
//    }
//  };
//}]);

//我的小区中的touchMove的点击事件
appDirective.directive('mycommunityList', ["$state", function ($state) {
  return {
    restrict: "EA",
    link: function ($scope, elem, attr) {

      var initX;
      var moveX;
      var X = 0;
      var objX = 0;

      //需要左划的li
      var rowName = "list-group-item";
      var deleteButtonW = 80;
      var obj;

      document.getElementById('table').addEventListener('touchstart', function (event) {
        //event.preventDefault();
        if (event.target.className == "row-content") {
          obj = event.target.parentNode;
        } else if (event.target.className == "community_name") {
          obj = event.target.parentNode.parentNode;
        } else if (event.target.className == "community_city") {
          obj = event.target.parentNode.parentNode;
        } else if (event.target.className == "floor") {
          obj = event.target.parentNode.parentNode;
        }

        if ($(obj).hasClass(rowName)) {
          initX = event.targetTouches[0].pageX;
          objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
        } else if (event.target.className == 'delete-button') {
          $(obj).remove();
        }
        if (objX == 0) {
          document.getElementById('table').addEventListener('touchmove', function (event) {
            event.preventDefault();
            if ($(obj).hasClass(rowName)) {
              moveX = event.targetTouches[0].pageX;
              X = moveX - initX;
              if (X > 0) {
                obj.style.WebkitTransform = "translateX(" + 0 + "px)";
              }
              else if (X < 0) {
                var l = Math.abs(X);
                obj.style.WebkitTransform = "translateX(" + -l + "px)";
                if (l > deleteButtonW) {
                  l = deleteButtonW;
                  obj.style.WebkitTransform = "translateX(" + -l + "px)";
                }
              }
            }
          });
        }
        else if (objX < 0) {
          document.getElementById('table').addEventListener('touchmove', function (event) {
            //event.preventDefault();
            if ($(obj).hasClass(rowName)) {
              moveX = event.targetTouches[0].pageX;
              X = moveX - initX;
              if (X > 0) {
                var r = -deleteButtonW + Math.abs(X);
                obj.style.WebkitTransform = "translateX(" + r + "px)";
                if (r > 0) {
                  r = 0;
                  obj.style.WebkitTransform = "translateX(" + r + "px)";
                }
              }
              else {     //向左滑动
                obj.style.WebkitTransform = "translateX(" + -deleteButtonW + "px)";
              }
            }
          });
        }

      })

      document.getElementsByClassName('community-table')[0].addEventListener('touchend', function (event) {
            //event.preventDefault();
            if ($(obj).hasClass(rowName)) {
              objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
              if (objX > -deleteButtonW * 0.5) {
                obj.style.WebkitTransform = "translateX(" + 0 + "px)";
              } else {
                obj.style.WebkitTransform = "translateX(" + -deleteButtonW + "px)";
              }
            }

            //点击事件
            if (X >= -5 && X < 5) {
              var parentsObj;
              var cityName;
              var communityName;
              var number;
              var communityId;
              var userName;
              var telphone;
              if ($(event.target).hasClass('community_name') || $(event.target).hasClass('community_city') || $(event.target).hasClass('floor')) {
                parentsObj = event.target.parentNode;
              }

              if ($(event.target).hasClass('row-content') || $(parentsObj).hasClass('parentsObj')) {
                for (var index = 0; index < $(event.target).children().length; index++) {
                  var classOne = $(event.target).children()[index];
                  if (index == 0) {
                    communityName = $(classOne).html();
                  } else if (index == 1) {
                    cityName = $(classOne).html();
                  } else if (index == 2) {
                    number = $(classOne).html();
                  } else if (index == 3) {
                    communityId = $(classOne).html();
                  } else if (index == 4) {
                    userName = $(classOne).html();
                  } else if (index == 5) {
                    telphone = $(classOne).html();
                  }
                }

                //页面跳转
                sessionStorage.cityName = cityName;
                sessionStorage.communityName = communityName;
                sessionStorage.floor = number;
                sessionStorage.communityId = communityId;
                sessionStorage.userName = userName;
                sessionStorage.tel = telphone;
                sessionStorage.parents = 'editcommunity';
                $state.go('member-user-mycommunityset');

              }

            }

          }
      )

    }
  };
}]);

//************************************ 滑动事件，点击事件 ************************************ //
//appDirective.directive('swipeclick', ["$state",function ($state) {
//  return {
//    restrict: "EA",
//    link: function ($scope, elem, attr) {
//
//      var initX;
//      var moveX;
//      var X = 0;
//      var objX = 0;
//
//      //需要左划的li
//      var rowName = "list-group-item";
//
//      var targetName = "row-content";
//      var targetName1 = "community_name";
//      var deleteButtonW = 80;
//
//      var obj;
//
//      document.getElementsByClassName('community-table')[0].addEventListener('touchstart', function (event) {
//        event.preventDefault();
//        if (event.target.className == targetName) {
//          obj = event.target.parentNode;
//        } else if (event.target.className == targetName1) {
//          obj = event.target.parentNode.parentNode;
//        }
//
//        if (obj.className == rowName) {
//          initX = event.targetTouches[0].pageX;
//          objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
//        }
//        if (objX == 0) {
//          window.addEventListener('touchmove', function (event) {
//            event.preventDefault();
//            if (obj.className == rowName) {
//              moveX = event.targetTouches[0].pageX;
//              X = moveX - initX;
//              if (X > 0) {
//                obj.style.WebkitTransform = "translateX(" + 0 + "px)";
//              } else if (X < 0) {
//                var l = Math.abs(X);
//                obj.style.WebkitTransform = "translateX(" + -l + "px)";
//                if (l > deleteButtonW) {
//                  l = deleteButtonW;
//                  obj.style.WebkitTransform = "translateX(" + -l + "px)";
//                }
//              }
//            }
//          });
//        } else if (objX < 0) {
//          document.getElementsByClassName('community-table')[0].addEventListener('touchmove', function (event) {
//            event.preventDefault();
//            if (obj.className == rowName) {
//              moveX = event.targetTouches[0].pageX;
//              X = moveX - initX;
//              if (X > 0) {
//                var r = -deleteButtonW + Math.abs(X);
//                obj.style.WebkitTransform = "translateX(" + r + "px)";
//                if (r > 0) {
//                  r = 0;
//                  obj.style.WebkitTransform = "translateX(" + r + "px)";
//                }
//              } else {     //向左滑动
//                obj.style.WebkitTransform = "translateX(" + -deleteButtonW + "px)";
//              }
//            }
//          });
//        }
//
//
//      })
//
//      document.getElementsByClassName('community-table')[0].addEventListener('touchend', function (event) {
//          event.preventDefault();
//          if (obj.className == rowName) {
//            objX = (obj.style.WebkitTransform.replace(/translateX\(/g, "").replace(/px\)/g, "")) * 1;
//            if (objX > -deleteButtonW * 0.5) {
//              obj.style.WebkitTransform = "translateX(" + 0 + "px)";
//            } else {
//              obj.style.WebkitTransform = "translateX(" + -deleteButtonW + "px)";
//            }
//          }
//
//          //点击事件
//          if (X >= -5 && X < 5) {
//            var parentsObj;
//            var cityName;
//            var communityName;
//            var number;
//            var communityId;
//            var userName;
//            var telphone;
//            if (event.target.className == 'community_name' || event.target.className == 'community_city' || event.target.className == 'floor') {
//              parentsObj = event.target.parentNode;
//            }
//
//            if (event.target.className == 'row-content' || parentsObj.className == 'parentsObj') {
//              for (var index = 0; index < $(event.target).children().length; index++) {
//                var classOne = $(event.target).children()[index];
//                if (index == 0) {
//                  communityName = $(classOne).html();
//                }else if (index == 1) {
//                  cityName = $(classOne).html();
//                }else if (index == 2) {
//                  number = $(classOne).html();
//                }else if (index == 3) {
//                  communityId = $(classOne).html();
//                }else if (index == 4) {
//                  userName = $(classOne).html();
//                }else if (index == 5) {
//                  telphone = $(classOne).html();
//                }
//              }
//
//              //页面跳转
//              sessionStorage.cityName = cityName;
//              sessionStorage.communityName = communityName;
//              sessionStorage.floor = number;
//              sessionStorage.communityId = communityId;
//              sessionStorage.userName = userName;
//              sessionStorage.tel = telphone;
//              sessionStorage.parents = 'editcommunity';
//              $state.go('member-user-mycommunityset');
//
//            }
//          }
//
//        }
//      )
//
//    }
//  };
//}]);


//渲染后处理1
appDirective.directive("handleHtmlPart", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {
        //alert($(elem.context).text());
        $scope.$watch(function () {

          elem.find('img').parent().css({'margin': '0rem'});
          elem.find('p').each(function () {
            if ($(this).text() != null && $(this).text().trim().length == 4) {
              $(this).css({'font-size': '1.6rem', 'color': '#333333'});
            }
          });

        });
      }, 0);
    }
  };
}]);

//跑马灯
appDirective.directive("createMarquee", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {

        $scope.$watch('content', function () {
          createMarquee({});

        });

      }, 0);
    }
  };
}]);


//轮播指令
appDirective.directive("owlCarousel", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {
        //alert($(elem.context).text());
        $scope.$watch(function () {
          if ($scope.list != null) {
            var owl = $("#owl-demo");

            owl.owlCarousel({
              navigation: false,
              slideSpeed: 400,
              pagination: false,
              paginationSpeed: 400,
              singleItem: true,
              rewindNav: false,
              dragBeforeAnimFinish: true,
              mouseDrag: false,
              touchDrag: true,

              afterMove: function () {
                elem.attr('data-current', this.owl.currentItem)//标记播放到第几个
                $scope.$apply(function () {
                  $scope.$eval(attr.owlCarousel);
                });
              }
            });
          }
        });
      }, 0);
    }
  };
}]);

//下拉刷新
/*DOM结构不限制
 * */
appDirective.directive("pullRefresh", ["$timeout", function (timer) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      timer(function () {
        $scope.$watch('audioList', function () {

          var startX;
          var startY;
          var div = $("<div></div>");
          var span = $("<span>下拉刷新</span>");
          var img = $("<img src='images/upD.png'/>");
          var freshHeight = 40;
          var currY = 0;
          var endY = 0;
          var isUL;
          var tranObj = {};
          tranObj.curreY = 0;
          div.append(img);
          div.append(span);
          div.css({
            'height': '40px',
            'transform': 'translateY(' + (-freshHeight) + 'px)',
            'position': 'absolute',
            'z-index': '1',
            'margin-left': '30%'
          });
          img.css({
            'width': '15%',
            'margin-right': '10px'
          });
          elem.before(div);  //注：append()或prepend()均不可行
          document.addEventListener('touchstart', startPull, false);
          document.addEventListener('touchmove', pullDown, false);
          document.addEventListener('touchend', pullEnd, false);


          function startPull(event) {
            isUL = $(event.target).parents('ul').html();
            var touch = event.touches[0];
            startX = parseInt(touch.pageX);
            startY = parseInt(touch.pageY);
            //console.log('----------start---------------');
          }


          function pullDown(event) {
            //console.log('------move-------------');
            var touch = event.touches[0];
            var x = parseInt(touch.pageX) - startX;
            var y = parseInt(touch.pageY) - startY;
            /*event.target.nodeName != 'UL' && !isUL
             * 以上两者条件只是解决与上拉加载更多一起使用引起的问题
             * */
            if (y > 0) {
              event.preventDefault();
              endY = y;
              currY = tranObj.curreY + y;
              elem.css({
                'transform': 'translateY(' + (y) + 'px)'
              });
              $(div).css({
                'transform': 'translateY(' + (-freshHeight + y) + 'px)'
              });
              if (currY > (freshHeight + 5)) {
                img.addClass('pullDown');
                img.css({
                  'transition': 'transform 250ms',
                  'transform': 'rotate(180deg)'
                });
                span.html('释放立即刷新');
              }
            }
          }

          function pullEnd(event) {
            //console.log('------end-------------');
            tranObj.curreY += endY;
            if (endY > 0 && tranObj.curreY > (freshHeight + 5)) {
              elem.css({
                'transform': 'translateY(' + freshHeight + 'px)'
              });
              $(div).css({
                'transform': 'translateY(0px)'
              });
              $(img).attr('src', 'images/load.gif');
              $(span).html('正在刷新......');
              pullDownAction();
            } else {
              elem.css({
                'transform': 'translateY(0px)'
              });
              $(div).css({
                'transform': 'translateY(' + (-freshHeight) + 'px)'
              });
            }

          }

          function pullDownAction() {
            setTimeout(function () {
              location.reload(true);
            }, 1000);
          }

        });
      }, 0);
    }
  };
}]);

//上拉加载与下拉刷新
/*DOM结构：<div><ul></ul></div>
 * div : 一定的宽度
 * 注：DOM结构也可以为：<div> <div>...</div> </div>
 *
 * */
appDirective.directive("loadMore", ["$timeout", "userService", function (timer, userService) {
  return {
    restrict: "A",
    link: function ($scope, elem, attr) {
      var data = $scope.$eval(attr.data);
      timer(function () {
        var startX;
        var startY;
        var endY;  //存放当前移动结束时，y的值
        var ulContain = $(elem.children()[0]);
        var count = 0;
        var isBack = false; //true:下拉超出2*freshHeight后，上拉到2*freshHeight内
        /*************刷新***********begin**********/
        var divFresh = $("<div></div>");
        var spanFresh = $("<span>下拉刷新</span>");
        var imgFresh = $("<img src='images/down2.png'/>");
        var freshHeight = 50;
        divFresh.append(imgFresh);
        divFresh.append(spanFresh);
        spanFresh.css({
          'display': 'none'
        });
        divFresh.css({
          'height': '50px',
          'transform': 'translateY(' + (-freshHeight) + 'px)',
          'position': 'absolute',
          'z-index': '1',
          'text-align': 'center',
          'line-height': '50px',
          'width': '100%'
        });
        imgFresh.css({
          'width': '35px',
          'margin-right': '10px',
          'display': 'none'
        });
        //elem.before(divFresh);  //注：append()或prepend()均不可行
        /*************刷新***********end**********/
        /*************加载***********begin**********/
        var div = $("<div class='loadMore'></div>");
        var img = $('<img src="images/down2.png"/>');
        var span = $('<span>查看更多</span>');
        var moreHeight = 50;
        div.css({
          'height': moreHeight + 'px',
          'text-align': 'center',
          'width': '100%',
          'line-height': moreHeight + 'px'
        });
        img.css({
          'width': '35px',
          'margin-right': '10px',
          'transform': 'rotate(180deg)',
        });
        div.append(img);
        div.append(span);
        /*************加载***********end**********/
        elem.scroll(function () {
          if (ulContain.outerHeight(true) >= elem.height()) {
            ulContain.after(div);
          }
          /* 该方法将$scope.elemScrollTop 同步到界面上*/
          /* $scope.elemScrollTop = elem.scrollTop();
           $scope.$apply('');*/

          //将elem.scrollTop()向父级传递
          $scope.$emit('scrollTop', elem.scrollTop());

          //console.log('scroll: ' + elem.scrollTop());
          //console.log('elem.scrollTop():'+elem.scrollTop());
          //console.log('=======:'+(ulContain.height()-elem.height()+moreHeight));
          var distance = ulContain.outerHeight(true) - elem.height() + moreHeight;
          if (elem.scrollTop() == 0 || (elem.scrollTop() >= (distance - 5) && elem.scrollTop() <= (distance + 5))) {
            //console.log('----到底了！------');
            endY = 0; //将endY的值置为0，防止使用上次移动的距离；
            ulContain.css({
              'transform': 'translateY(0px)'
            });
            $('.loadMore').css({
              'transform': 'translateY(0px)'
            });
            $(this).bind('touchstart', moveStart);
            $(this).bind('touchmove', moving);
            $(this).bind('touchend', moveEnd);
            $(this).bind('touchcancel', moveEnd);
          } else {
            //console.log('---------unbind------------');
            $(this).unbind('touchstart', moveStart);
            $(this).unbind('touchmove', moving);
            $(this).unbind('touchend', moveEnd);
            $(this).unbind('touchcancel', moveEnd);
          }
        });

        function moveStart() {
          //console.log('----------------start---------------');
          endY = 0; //将endY的值置为0，防止使用上次移动的距离；
          var touch = event.touches[0];
          startX = parseInt(touch.pageX);
          startY = parseInt(touch.pageY);
          elem.before(divFresh);  //注：append()或prepend()均不可行
        }

        function moving() {
          //console.log('----------move---------------');
          //console.log('move-scrollTop: ' + elem.scrollTop());
          var touch = event.touches[0];
          var x = parseInt(touch.pageX) - startX;
          var y = parseInt(touch.pageY) - startY;
          if (y < 0) { //上拉加载更多
            ulContain.css({
              'transform': 'translateY(' + y + 'px)'
            });
            $('.loadMore').css({
              'transform': 'translateY(' + y + 'px)'
            });
            if (Math.abs(y) > 5) {
              //console.log('--------move--y>5--------');
              span.html('松开加载更多');
              //img.attr('src', 'images/load.gif');
              img.css({
                'transition': 'transform 1000ms',
                'transform': 'rotate(360deg)'
              });
            }

          } else if (y > 0 && elem.scrollTop() == 0) { //下拉刷新
            event.preventDefault();
            elem.css({
              'transform': 'translateY(' + (y) + 'px)'
            });
            divFresh.css({
              'transform': 'translateY(' + (-freshHeight + y) + 'px)'
            });

            if (y > 0) {
              imgFresh.css({
                'display': 'inline-block'
              });
              spanFresh.css({
                'display': 'inline-block'
              });
            }
            if (isBack && y >= freshHeight && y < (freshHeight * 2)) {
              imgFresh.css({
                'transition': 'transform 1000ms',
                'transform': 'rotate(-180deg)'
              });
              spanFresh.html('下拉刷新');
              isBack = false;
            }

            if (y > (freshHeight * 2)) {
              isBack = true;
              imgFresh.css({
                'transition': 'transform 1000ms',
                'transform': 'rotate(180deg)'
              });
              spanFresh.html('松开刷新');
            }
          }
          endY = y;
        }

        function moveEnd() {
          //console.log('-----------end-------------------');
          //console.log('touchend--scrollTop: ' + elem.scrollTop());
          /*&& Math.abs(endY) > 20*/
          if (endY < 0) {  //上拉加载
            ulContain.css({
              'transform': 'translateY(0px)'
            });
            $('.loadMore').css({
              'transform': 'translateY(0px)'
            });
            img.attr('src', 'images/load.gif');
            span.html('正在加载更多');

            $(this).unbind('touchstart', moveStart);
            $(this).unbind('touchmove', moving);
            $(this).unbind('touchend', moveEnd);
            $(this).unbind('touchcancel', moveEnd);

            pullUpAction();
          } else if (endY > 0) { //下拉刷新
            if (endY > (freshHeight * 2)) {
              elem.css({
                'transform': 'translateY(' + freshHeight + 'px)'
              });
              divFresh.css({
                'transform': 'translateY(0px)'
              });
              imgFresh.attr('src', 'images/load.gif');
              spanFresh.html('正在刷新......');

              $(this).unbind('touchstart', moveStart);
              $(this).unbind('touchmove', moving);
              $(this).unbind('touchend', moveEnd);
              $(this).unbind('touchcancel', moveEnd);
              pullDownAction();
              isBack = false;
            } else {
              elem.css({
                'transform': 'translateY(0px)'
              });
              $(divFresh).css({
                'transform': 'translateY(' + (-freshHeight) + 'px)'
              });
            }
          }
        }

        //上拉加载更多数据
        function pullUpAction() {
          if (data.condition == '发货') {
            data.params.type_id = $scope.conditionParams.type_id;
            data.params.date = $scope.conditionParams.date;
            data.params.business_id = $scope.conditionParams.business_id;
          }
          if (data.condition == '派发') {
            data.params.date = $scope.cdtParams.date;
            data.params.service_station_id = $scope.cdtParams.service_station_id;
            data.params.fuwu_id = $scope.cdtParams.fuwu_id;
          }
          data.params.direction = 'up';
          data.params.pageno++;
          var promise = eval("(" + data.repeatFun + ")")(data.params);
          //根据数据加载情况(完成与未完成)，来判断之后执行内容
          promise.then(function (data) {
            //数据加载后，样式恢复为初始状态
            img.attr('src', 'images/down2.png');
            img.css({
              'transform': '',
              'transition': ''
            });
            /*判断数据是否加载完成，根据data值，修改提示信息*/
            if (data) {//加载完成
              span.html('没有更多数据');
              img.css({
                'display': 'none'
              });
            } else {
              //console.log('---moveend--data--false-');
              span.html('查看更多');
              img.css({
                'transform': 'rotate(180deg)',
              });
            }
          });
        }

        //下拉初始化数据，即：加载第一页的数据
        function pullDownAction() {
          if (data.condition == '发货') {
            data.params.type_id = $scope.conditionParams.type_id;
            data.params.date = $scope.conditionParams.date;
            data.params.business_id = $scope.conditionParams.business_id;
          }
          if (data.condition == '派发') {
            data.params.date = $scope.cdtParams.date;
            data.params.service_station_id = $scope.cdtParams.service_station_id;
            data.params.fuwu_id = $scope.cdtParams.fuwu_id;
          }
          data.params.direction = 'down';
          data.params.pageno = 1;
          var promise = eval("(" + data.repeatFun + ")")(data.params);
          promise.then(function (data) {
            //数据加载后，样式恢复为初始状态
            elem.css({
              'transform': 'translateY(0px)'
            });
            divFresh.css({
              'transform': 'translateY(' + (-freshHeight) + 'px)'
            });
            imgFresh.attr('src', 'images/down2.png');
            imgFresh.css({
              'transition': '',
              'transform': '',
              'display': 'none'
            });
            spanFresh.css({
              'display': 'none'
            });
            spanFresh.html('下拉刷新');
            span.html('查看更多');
            img.css({
              'display': 'inline-block'
            });
          });
        }

      }, 0);
    }
  };
}]);

//手风琴效果
appDirective.directive('customAccordion', function () {
  return {
    scope: {
      ngModel: '='
    },
    restrict: 'A',
    template: '<div class="panel-group" id="{{panelId}}">\
                       <div class="panel panel-default panel-border-none" ng-repeat="item in ngModel">\
                           <div class="panel-heading">\
                               <h4 class="panel-title">\
<span class="collapsed" ng-click="toggleCollapsedStates($index)" href="#{{panelBaseId}}-{{$index}}">{{item.title}}</span>\
                               </h4>\
                           </div>\
<div id="{{panelBaseId}}-{{$index}}" data-parent="#{{panelId}}" class="panel-collapse collapse in">\
                              <ul class="panel-body" ng-repeat="k in item.content">\
    <li><a href="">{{k}}</a></li>\
  </ul>\
                           </div>\
                       </div>\
                   </div>',
    link: function (scope, el, attrs) {
      scope.panelBaseId = attrs.collapsePanelBodyId;
      scope.panelId = attrs.collapsePanelId;

      $(document).ready(function () {
        angular.forEach(scope.ngModel, function (value, key) {
          if (value.collapsed) {
            $("#" + scope.panelBaseId + "-" + key).collapse('show');
          }
        });
      });

      scope.toggleCollapsedStates = function (ind) {
        angular.forEach(scope.ngModel, function (value, key) {
          if (key == ind) {
            scope.ngModel[key].collapsed = !scope.ngModel[key].collapsed;
            $("#" + scope.panelBaseId + "-" + ind).collapse('toggle');
          }
          else
            scope.ngModel[key].collapsed = false;
        });
      }
    }
  };
});

appDirective.directive('bsSwitch', function ($parse, $timeout) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function link(scope, element, attrs, controller) {
      var isInit = false;

      /**
       * Return the true value for this specific checkbox.
       * @returns {Object} representing the true view value; if undefined, returns true.
       */
      var getTrueValue = function () {
        if (attrs.type === 'radio') {
          return attrs.value || $parse(attrs.ngValue)(scope) || true;
        }
        var trueValue = ($parse(attrs.ngTrueValue)(scope));
        if (angular.isUndefined(trueValue)) {
          trueValue = true;
        }
        return trueValue;
      };

      /**
       * Get a boolean value from a boolean-like string, evaluating it on the current scope.
       * @param value The input object
       * @returns {boolean} A boolean value
       */
      var getBooleanFromString = function (value) {
        return scope.$eval(value) === true;
      };

      /**
       * Get a boolean value from a boolean-like string, defaulting to true if undefined.
       * @param value The input object
       * @returns {boolean} A boolean value
       */
      var getBooleanFromStringDefTrue = function (value) {
        return (value === true || value === 'true' || !value);
      };

      /**
       * Returns the value if it is truthy, or undefined.
       *
       * @param value The value to check.
       * @returns the original value if it is truthy, {@link undefined} otherwise.
       */
      var getValueOrUndefined = function (value) {
        return (value ? value : undefined);
      };

      /**
       * Returns a function that executes the provided expression
       *
       * @param value The string expression
       * @return a function that evaluates the expression
       */
      var getExprFromString = function (value) {
        if (angular.isUndefined(value)) {
          return angular.noop;
        }
        return function () {
          scope.$evalAsync(value);
        };
      };

      /**
       * Get the value of the angular-bound attribute, given its name.
       * The returned value may or may not equal the attribute value, as it may be transformed by a function.
       *
       * @param attrName  The angular-bound attribute name to get the value for
       * @returns {*}     The attribute value
       */
      var getSwitchAttrValue = function (attrName) {
        var map = {
          'switchRadioOff': getBooleanFromStringDefTrue,
          'switchActive': function (value) {
            return !getBooleanFromStringDefTrue(value);
          },
          'switchAnimate': getBooleanFromStringDefTrue,
          'switchLabel': function (value) {
            return value ? value : '&nbsp;';
          },
          'switchIcon': function (value) {
            if (value) {
              return '<span class=\'' + value + '\'></span>';
            }
          },
          'switchWrapper': function (value) {
            return value || 'wrapper';
          },
          'switchInverse': getBooleanFromString,
          'switchReadonly': getBooleanFromString,
          'switchChange': getExprFromString
        };
        var transFn = map[attrName] || getValueOrUndefined;
        return transFn(attrs[attrName]);
      };

      /**
       * Set a bootstrapSwitch parameter according to the angular-bound attribute.
       * The parameter will be changed only if the switch has already been initialized
       * (to avoid creating it before the model is ready).
       *
       * @param element   The switch to apply the parameter modification to
       * @param attr      The name of the switch parameter
       * @param modelAttr The name of the angular-bound parameter
       */
      var setSwitchParamMaybe = function (element, attr, modelAttr) {
        if (!isInit) {
          return;
        }
        var newValue = getSwitchAttrValue(modelAttr);
        element.bootstrapSwitch(attr, newValue);
      };

      var setActive = function () {
        setSwitchParamMaybe(element, 'disabled', 'switchActive');
      };

      /**
       * If the directive has not been initialized yet, do so.
       */
      var initMaybe = function () {
        // if it's the first initialization
        if (!isInit) {
          var viewValue = (controller.$modelValue === getTrueValue());
          isInit = !isInit;
          // Bootstrap the switch plugin
          element.bootstrapSwitch({
            radioAllOff: getSwitchAttrValue('switchRadioOff'),
            disabled: getSwitchAttrValue('switchActive'),
            state: viewValue,
            onText: getSwitchAttrValue('switchOnText'),
            offText: getSwitchAttrValue('switchOffText'),
            onColor: getSwitchAttrValue('switchOnColor'),
            offColor: getSwitchAttrValue('switchOffColor'),
            animate: getSwitchAttrValue('switchAnimate'),
            size: getSwitchAttrValue('switchSize'),
            labelText: attrs.switchLabel ? getSwitchAttrValue('switchLabel') : getSwitchAttrValue('switchIcon'),
            wrapperClass: getSwitchAttrValue('switchWrapper'),
            handleWidth: getSwitchAttrValue('switchHandleWidth'),
            labelWidth: getSwitchAttrValue('switchLabelWidth'),
            inverse: getSwitchAttrValue('switchInverse'),
            readonly: getSwitchAttrValue('switchReadonly')
          });
          if (attrs.type === 'radio') {
            controller.$setViewValue(controller.$modelValue);
          } else {
            controller.$setViewValue(viewValue);
          }
        }
      };

      /**
       * Listen to model changes.
       */
      var listenToModel = function () {

        attrs.$observe('switchActive', function (newValue) {
          var active = getBooleanFromStringDefTrue(newValue);
          // if we are disabling the switch, delay the deactivation so that the toggle can be switched
          if (!active) {
            $timeout(function () {
              setActive(active);
            });
          } else {
            // if we are enabling the switch, set active right away
            setActive(active);
          }
        });

        function modelValue() {
          return controller.$modelValue;
        }

        // When the model changes
        scope.$watch(modelValue, function (newValue) {
          initMaybe();
          if (newValue !== undefined && newValue !== null) {
            element.bootstrapSwitch('state', newValue === getTrueValue(), false);
          } else {
            element.bootstrapSwitch('toggleIndeterminate', true, false);
          }
        }, true);

        // angular attribute to switch property bindings
        var bindings = {
          'switchRadioOff': 'radioAllOff',
          'switchOnText': 'onText',
          'switchOffText': 'offText',
          'switchOnColor': 'onColor',
          'switchOffColor': 'offColor',
          'switchAnimate': 'animate',
          'switchSize': 'size',
          'switchLabel': 'labelText',
          'switchIcon': 'labelText',
          'switchWrapper': 'wrapperClass',
          'switchHandleWidth': 'handleWidth',
          'switchLabelWidth': 'labelWidth',
          'switchInverse': 'inverse',
          'switchReadonly': 'readonly'
        };

        var observeProp = function (prop, bindings) {
          return function () {
            attrs.$observe(prop, function () {
              setSwitchParamMaybe(element, bindings[prop], prop);
            });
          };
        };

        // for every angular-bound attribute, observe it and trigger the appropriate switch function
        for (var prop in bindings) {
          attrs.$observe(prop, observeProp(prop, bindings));
        }
      };

      /**
       * Listen to view changes.
       */
      var listenToView = function () {

        var switchChangeFn = getSwitchAttrValue('switchChange');

        if (attrs.type === 'radio') {
          // when the switch is clicked
          element.on('change.bootstrapSwitch', function (e) {
            // discard not real change events
            if ((controller.$modelValue === controller.$viewValue) && (e.target.checked !== $(e.target).bootstrapSwitch('state'))) {
              // $setViewValue --> $viewValue --> $parsers --> $modelValue
              // if the switch is indeed selected
              if (e.target.checked) {
                // set its value into the view
                controller.$setViewValue(getTrueValue());
              } else if (getTrueValue() === controller.$viewValue) {
                // otherwise if it's been deselected, delete the view value
                controller.$setViewValue(undefined);
              }
              switchChangeFn();
            }
          });
        } else {
          // When the checkbox switch is clicked, set its value into the ngModel
          element.on('switchChange.bootstrapSwitch', function (e) {
            // $setViewValue --> $viewValue --> $parsers --> $modelValue
            controller.$setViewValue(e.target.checked);
            switchChangeFn();
          });
        }
      };

      // Listen and respond to view changes
      listenToView();

      // Listen and respond to model changes
      listenToModel();

      // On destroy, collect ya garbage
      scope.$on('$destroy', function () {
        element.bootstrapSwitch('destroy');
      });
    }
  };
})
    .directive('bsSwitch', function () {
      return {
        restrict: 'E',
        require: 'ngModel',
        template: '<input bs-switch>',
        replace: true
      };
    });

appDirective.directive('contenteditable', function () {
  return {
    restrict: 'A', // only activate on element attribute
    require: '?ngModel', // get a hold of NgModelController
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) {
        return;
      } // do nothing if no ng-model
      // Specify how UI should be updated
      ngModel.$render = function () {
        element.html(ngModel.$viewValue || '');
      };
      // Listen for change events to enable binding
      element.on('blur keyup change', function () {
        scope.$apply(readViewText);
      });
      // No need to initialize, AngularJS will initialize the text based on ng-model attribute
      // Write data to the model
      function readViewText() {
        var html = element.html();
        // When we clear the content editable the browser leaves a <br> behind
        // If strip-br attribute is provided then we strip this out
        if (attrs.stripBr && html === '<br>') {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
});

//定位
appDirective.directive('getLocation', function () {
  return {
    restrict: "EA",
    link: function ($scope, elem, attr) {

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
        console.log("浏览器不支持地理定位。")
      }

      //报错
      function showError(error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.log("定位失败,用户拒绝请求地理定位");
            break;
          case error.POSITION_UNAVAILABLE:
            console.log("定位失败,位置信息是不可用");
            break;
          case error.TIMEOUT:
            console.log("定位失败,请求获取用户位置超时");
            break;
          case error.UNKNOWN_ERROR:
            console.log("定位失败,定位系统失效");
            break;
        }
      }

      //定位
      function showPosition(position) {
        //经纬度
        var lat = position.coords.latitude;
        var lag = position.coords.longitude;
        var latlon = lat + ',' + lag;

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
              $("#position").html(json.result.formatted_address);
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            $("#position").html(latlon + "地址位置获取失败");
          }
        })
      }

    }
  };
});
//全选 或 订单下所有商品的全选
appDirective.directive('checkAll', [function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var data = scope.$eval(attrs.data);
      var eachElem;

      scope.$watch('elem', function () {
        elem.on('click', function () {
          if (data.type == '全选') {
            eachElem = $(data.range + ' .sure');
          } else if (data.type == '订单') {
            eachElem = elem.parents('.line').siblings().find('.sure');
          }
          if (!elem.hasClass('checked')) {
            $.each(eachElem, function (index, domEl) {
              if (!$(domEl).hasClass('checked')) {
                $(domEl).addClass('checked');
                $(domEl).attr('src', 'images/checked.jpg');
              }
            });
            elem.addClass('checked');
            elem.attr('src', 'images/checked.jpg');
            //所有订单都选中时，将全部设置为选中状态
            if (data.type == '订单') {
              var siblingsElem = elem.parents('.list-group').siblings().find('.orderSure');
              var allElem = $(data.range).find('.all');
              var isAllOrder = true;
              $.each(siblingsElem, function (index, domElem) {
                if (!$(domElem).hasClass('checked')) {
                  isAllOrder = false;
                }
              });
              if (isAllOrder) {
                allElem.addClass('checked');
                allElem.attr('src', 'images/checked.jpg');
              }
            }
          } else {
            $.each(eachElem, function (index, domEl) {
              if ($(domEl).hasClass('checked')) {
                $(domEl).removeClass('checked');
                $(domEl).attr('src', 'images/sure-icon.png');
              }
            });
            //如果有一个没选中，则去掉全选按钮的选中状态
            if (data.type == '订单' && $('.all').hasClass('checked')) {
              $('.all').removeClass('checked');
              $('.all').attr('src', 'images/sure-icon.png');
            }
            elem.removeClass('checked');
            elem.attr('src', 'images/sure-icon.png');
          }
        });
      });
    }
  }
}]);
//单个选中与不选中 --- 商品
appDirective.directive('checkGood', ['commonService', function (commonService) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {

      var data = scope.$eval(attrs.data);
      scope.$watch('elem', function () {
        elem.on('click', function () {
          event.stopPropagation();

          var status = elem.parents('.deliver_list').find('.good_status').html();
          var orderSure = elem.parents('.list-group').find('.orderSure');
          if (elem.hasClass('checked')) {
            elem.removeClass('checked');
            elem.attr('src', 'images/sure-icon.png');
            //如果有一个没选中，则去掉全选按钮的选中状态
            if ($('.all').hasClass('checked')) {
              $('.all').removeClass('checked');
              $('.all').attr('src', 'images/sure-icon.png');
            }
            //如果有一个商品没选中，该订单去掉选中状态
            orderSure.removeClass('checked');
            orderSure.attr('src', 'images/sure-icon.png');
          } else {
            elem.addClass('checked');
            elem.attr('src', 'images/checked.jpg');
            //该商品所在的订单下的所有商品都为选中状态，则该订单也为选中状态
            var goodsElem = elem.parents('.list-group').find('.sure');
            var isOrder = true;
            $.each(goodsElem, function (index, domElem) {
              //存在一个商品没选中，则将isAll置为false;
              if (!$(domElem).hasClass('orderSure') && !$(domElem).hasClass('checked')) {
                isOrder = false;
                return;
              }
            });
            //订单下的商品都选中，则将订单设置为选中状态
            if (isOrder) {
              orderSure.addClass('checked');
              orderSure.attr('src', 'images/checked.jpg');
            }

            //当前页面所有商品选中，则把全部设置为选中状态
            var allGoodsStatus = $(data.range).find('.sure');
            var allElem = $(data.range).find('.all');
            var isAll = true;
            $.each(allGoodsStatus, function (index, domElem) {
              if (!$(domElem).hasClass('checked')) {
                isAll = false;
              }
            });
            if (isAll) {
              allElem.addClass('checked');
              allElem.attr('src', 'images/checked.jpg');
            }

          }
        });
      });
    }
  }
}]);

//我发货商品页
appDirective.directive('checkOne', ['commonService', function (commonService) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      //var data = $scope.$eval(attrs.data);
      //console.log(data);
      $scope.$watch('elem', function () {
        elem.on('click', function () {
          //if(data.range == '发货'){
          /*var status = elem.parents('.deliver_list').find('.good_status').html();
           if (status == '待发货') {*/
          if (elem.hasClass('checked')) {
            elem.removeClass('checked');
            elem.attr('src', 'images/sure-icon.png');
          } else {
            elem.addClass('checked');
            elem.attr('src', 'images/checked.jpg');
          }
          /*} else {
           commonService.showWarnMessage('非待发货的无法执行该操作！');
           }*/
          //}else if(data.range == '派发'){
          /*var paiDate = elem.next().html();
           if(!paiDate){*/
          /*if (elem.hasClass('checked')) {
           elem.removeClass('checked');
           elem.attr('src', 'images/sure-icon.png');
           } else {
           elem.addClass('checked');
           elem.attr('src', 'images/checked.jpg');
           }*/
          /*}else{
           commonService.showWarnMessage('已派发的不能执行该操作!');
           }*/
          //}
        });
      });
    }
  }
}]);

//tab切换
appDirective.directive('changeTab', [function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      $('.sellerWelfare .tabs li a').css({
        'background-color': '#ddd'
      });
      $('.sellerWelfare .tabs li:first-child a').css({
        'background-color': 'rgb(164,214,40)'
      });
      elem.on('click', function () {
        //console.log(elem.parent().siblings().children());
        $scope.$apply(function () {
          $scope.clickTab = elem.html();
        });
        elem.css({
          'background-color': 'rgb(164,214,40)'
        });
        elem.parent().siblings().children().css({
          'background-color': '#ddd'
        });

      });
    }
  }
}]);

//家庭服务&特供服务----选项卡切换
appDirective.directive('changeService', ['$rootScope', '$cookies', function ($rootScope, $cookies) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      var datas = $scope.$eval(attrs.data);
      var buffer;
      if (datas.parentClass == '.familyservice-segementcontrol') {
        buffer = $scope.service_promise;
      }
      else if (datas.parentClass == '.breakfast-supper-block') {
        buffer = $scope.specialService;
      }


      if (buffer != null) {
        buffer.then(function (data) {
          if (data.length > 0) {
            //console.log(data);
            if ($scope.from == '0' || $scope.from != '1') {
              //console.log($rootScope.supportTabIndex)
              if ($rootScope.supportTabIndex != null && $scope.from != '%guanggao%') {
                //console.log('----11-----');
                $(datas.parentClass).find('span').eq($rootScope.supportTabIndex).prev().addClass('familyservice-active');
                $(datas.parentClass).find('span').eq($rootScope.supportTabIndex).prev().addClass('breakfast-active');
              } else if ($rootScope.supportTabIndex == 0 && $scope.from != '%guanggao%') {
                //console.log('----22-----');
                //默认选中选项卡第一项
                $(datas.parentClass + ' ' + datas.childClass + ':first-child a').addClass('familyservice-active');
                $(datas.parentClass + ' ' + datas.childClass + ':first-child a').addClass('breakfast-active');
              } else if ($scope.from == '%guanggao%') {
                //console.log('----33-----');
                $(datas.parentClass).find('span').eq($scope.tabIndex).prev().addClass('familyservice-active');
                $(datas.parentClass).find('span').eq($scope.tabIndex).prev().addClass('breakfast-active');
              } else {
                //console.log('----44-----');
                if (typeof $scope.tabIndex != 'undefined') $rootScope.supportTabIndex = $scope.tabIndex;
                else $rootScope.supportTabIndex = 0;
                $(datas.parentClass + ' ' + datas.childClass).eq(parseInt($rootScope.supportTabIndex)).find('a').addClass('familyservice-active');
                $(datas.parentClass + ' ' + datas.childClass).eq(parseInt($rootScope.supportTabIndex)).find('a').addClass('breakfast-active');
              }

            } else if ($scope.from == '1') {
              $scope.button = $(datas.childClass + ' > a ');
              $.each($scope.button, function (i, value) {
                if (i == $scope.drycleanIndex) {
                  $scope.dryclean = $(value);
                  $scope.dryclean.addClass("familyservice-active");
                  $scope.dryclean.addClass('breakfast-active');
                }
              });
              $rootScope.supportTabIndex = $scope.drycleanIndex;//设置卡头的索引
            }

            $(datas.listClass).css('display', 'none');
            $('.show0').css('display', 'block');
          }

          //选项卡(至少两个选项)未超过设备宽度时，平分设备宽度
          var diveceH = window.screen.availWidth;
          var parentH = $(datas.parentClass).innerWidth();
          var dValue = diveceH - parentH;
          if (dValue > 0 && data.length >= 2) {
            $(datas.parentClass).css({
              'justify-content': 'space-around',
              '-webkit-justify-content': 'space-around',
              '-moz-justify-content': 'space-around',
              '-ms-justify-content': 'space-around',
              '-o-justify-content': 'space-around'
            });
          }
        });

        elem.on('click', function () {
          //点击的选项卡的样式
          //$(datas.childItem).removeClass('familyservice-active');
          $(datas.childItem).css({
            color: '#333'
          });
          $(datas.childItem).removeClass('breakfast-active');
          elem.css({
            color: '#fff'
          });
          elem.addClass('breakfast-active');
          //点击选项卡切换对应的内容区域
          var index = elem.next().html();
          $rootScope.supportTabIndex = parseInt(index);
          $(datas.listClass).css('display', 'none');
          $('.show' + index).css('display', 'block');
        });
      }
    }
  }
}]);

//服务列表--商品分类切换
appDirective.directive('cateChange', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var datas = $scope.$eval(attr.data);
      var promise = eval("(" + datas.promise + ")");
      if ($scope.$last) {
        promise.then(function (data) {
          if (data.length > 0) {
            //默认选中项
            if (localStorage.skip == 'detail' || localStorage.skip == 'purchase' || $scope.from == '%guanggao%' || $scope.from == '%couponsSeller%') {
              //从详情页跳转到列表页
              var childElems = $(datas.child);
              //console.log(childElems);
              childElems.css({
                'border-bottom': 'none',
                'color': '#000'
              });
              $(childElems[localStorage.showType]).css({
                'border-bottom': '3px solid #7DB343',
                'color': '#7DB343'
              });
              //数据列表
              $(datas.goodslist).css('display', 'none');
              $('.show' + localStorage.showType).css('display', 'block');
            } else {
              //从服务页到列表页
              $(datas.parent + ' ' + datas.child + ':first-child').css({
                'border-bottom': '3px solid #7DB343',
                'color': '#7DB343'
              });
              $(datas.goodslist).css('display', 'none');
              $('.show' + $scope.index).css('display', 'block');
              //清空skip的值
              localStorage.skip = '';
            }


            //判断选项卡总宽度是否超过设备宽度，如果超过滑动，没有超过平分设备宽度
            var deviceH = $(window).width();
            var elemTotalWidth = 0;
            var totalLength = 0;
            $.each($(datas.child), function (index, domElem) {
              var elemWidth = $(domElem).outerWidth(true);
              elemTotalWidth += elemWidth;
              totalLength += 1;
            });
            var dValue = deviceH - elemTotalWidth;
            if (dValue > 0) {
              var unitWidth = parseInt(dValue / totalLength);
              $.each($(datas.child), function (index, domElem) {
                var curWidth = $(domElem).outerWidth() + unitWidth;
                $(domElem).css('width', curWidth + 'px');
              });
            }

            //计算滚动区域的高度
            var contentH = $(window).height() - $('.navigationbar').outerHeight();
            var sellerNameH = $('.good-seller-name').outerHeight();
            var marqueeH = 0;
            var dynamicH = 0;
            $scope.noticePromise.then(function (noticeData) {
              if (noticeData.length > 0) {
                marqueeH = 25;
              }
              var filterH = 0;
              if (datas.goodslist != '.familyaccountlist-table') {
                filterH = $('.filter-block').outerHeight();
              }
              if (data.length > 1) {
                dynamicH = $('.dynamic-tabs').outerHeight();
              }
              contentH = contentH - sellerNameH - marqueeH - filterH - dynamicH;
              $('.common-contentList').css({
                'overflow': 'scroll',
                'height': contentH + 'px'
              });
            });

          }
        });
      }

      elem.on('click', function () {
        //点击选中的选项卡样式设置
        $(datas.child).css({
          'border-bottom': 'none',
          'color': '#000'
        });
        elem.css({
          'border-bottom': '3px solid #7DB343',
          'color': '#7DB343'
        });
        //点击分类，切换对应的内容
        $(datas.goodslist).css('display', 'none');
        $('.show' + $scope.index).css('display', 'block');
      });

    }
  }
});
//服务详情页倒计时
appDirective.directive('countDown', function ($interval) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      function getRTime(end_date) {
        //var EndTime= new Date('2016/07/5 10:00:00');
        var EndTime = new Date(end_date);
        var NowTime = new Date();
        var t = EndTime.getTime() - NowTime.getTime();
        var day = Math.floor(t / 1000 / 60 / 60 / 24);
        var hour = Math.floor(t / 1000 / 60 / 60 % 24);
        var minute = Math.floor(t / 1000 / 60 % 60);
        var second = Math.floor(t / 1000 % 60);
        elem.html("开卖倒计时:" + day + "天" + hour + "小时" + minute + "分" + second + "秒");
      }

      $scope.detailPromise.then(function (data) {
        if (data.start_date) {
          $interval(function () {
            getRTime(data.start_date);
          }, 1000);
        } else {
          elem.css('height', '5px');
        }
      });
    }
  }
});

//计算高度  ----  获取轮播图数据后计算高度
appDirective.directive('calHeight', function (guanjiaService) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var data = $scope.$eval(attr.data);
      var divH = data.classN;
      var busHeight = window.screen.availHeight - $('.navigationbar').height();
      var carouselH = 0;
      var marqueeH = 0;
      var segmentH = $('.tab-change-control').css('height') == undefined ? 0 : parseInt($('.tab-change-control').css('height'));
      //var promise = guanjiaService.getAdverts();
      //promise.then(function (data) {
      //  if (data.length > 0) {
      //    carouselH = 150;
      //    //$scope.slides = data;
      //  }
      if ($('.marquee_box').height() != null) {
        marqueeH = $('.marquee_box').height();
      }
      var supportHeight = busHeight - segmentH - carouselH
          - marqueeH - $('.support-prompt').height();
      $(divH).css({
        'height': supportHeight + 'px',
        'overflow': 'scroll'
      });
      $('.errMsg').css({
        'height': supportHeight + 'px'
      });
      //});
    }
  }
});

//根据后台返回的公告信息，判断分页滚动条区域  ---- 特工服务中的商品列表页
//    && familyservicelist.html  && familyaccountlist.html
appDirective.directive('goodHeight', function (guanjiaService) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var data = $scope.$eval(attr.data);
      var navbarH = $('.navigationbar').outerHeight();
      var sellerH = $('.service-name').outerHeight();
      var segmentH = $('.change-tabs').outerHeight();
      var marqueenH = 0;
      var resultH = window.screen.availHeight - navbarH - sellerH - segmentH;
      if (data.type == '0') {
        var selectedH = $('.select-items').outerHeight(true);
        resultH = resultH - selectedH;
      }

      var promise = guanjiaService.getNotice($scope.noticeParams);
      promise.then(function (data) {
        if (data.length > 0) {
          marqueenH = $('.marquee_box').height();
          resultH = resultH - marqueenH;
          $scope.marqueeContent = data;
        }
        $('.common-contentList').css({
          'height': resultH + 'px',
          'overflow': 'scroll',
        });
      });
    }
  }
});

//轮播图高度
appDirective.directive('curouselHeight', function ($location) {

  return {
    restrict: 'A',
    link: function ($rootScope, $scope, elem, attr) {
      if ($location.$$path != '/service/goodsDetail.htm' && $location.$$path != '/guanjia/familyservicedetail.htm') {
        $('.slideImg').css({
          'width': $rootScope.width + 'px',
          'height': $rootScope.width * 9 / 16 + 'px'
        });
      } else {
        $('.slideImg').css({
          'width': $rootScope.width + 'px',
          'height': $rootScope.width * 3 / 5 + 'px'
        });
      }
      //消除掉轮播的左右图标
      var buttonArray = $(".carousel-ad-images").find(".carousel-control");
      for (var index = 0; index < buttonArray.length; index++) {
        var className = buttonArray[index];
        $(className).css({
          'display': 'none'
        });
      }
    }
  }

});


//购物车选项卡切换效果
appDirective.directive('cartTab', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      if ($scope.btnType == '购买') {
        $('.cart-tab .btn-tab:first-child').addClass('selected');
      } else if ($scope.btnType == '预约') {
        $('.cart-tab .btn-tab:last-child').addClass('selected');
      }
      $('.search-input .form-control').val('');

      $scope.isShowOrders = true;
      var selectAll = $('.cart-all-select-button img');
      elem.on('click', function () {
        $('.search-input .form-control').val('');
        $scope.isShowOrders = true;
        if (selectAll.hasClass('selectAll')) {
          selectAll.removeClass('selectAll');
          selectAll.attr('src', 'images/sure-icon.png');
        }
        $('.cart-tab .btn-tab').removeClass('selected');
        elem.addClass('selected');
      });
    }
  }
});

//用户城市选择
appDirective.directive('usercitySelect', function ($rootScope, $location, userService, $cookies, commonService, $state, guanjiaService, $q) {

  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {

      if ($cookies.get('ticket')) {
        $scope.citySelect = true;
        //城市列表
        $scope.UserCityparams = {
          pageno: '1',
          pagesize: '6',
          ticket: $cookies.get('ticket')
        };
        userService.listUserCity($scope.UserCityparams).success(function (data) {

          switch (data.code) {
            case '0':
              $scope.usercityList = data.data.list;
              //判断默认城市ID是否在城市列表中
              var cityidList = [];
              for (var i = 0; i < $scope.usercityList.length; i++) {
                var cityId = $scope.usercityList[i].city_id;
                cityidList.push(cityId);
              }
              if (cityidList.toString().indexOf(sessionStorage.gpscityId) > -1) {
                sessionStorage.cityListChange = false;
              } else {
                sessionStorage.cityListChange = true;
              }

              break;
            case '1':
              commonService.showWarnMessage("返回失败！");
              break;
            case '-8':
              $scope.citySelect = false;
              $scope.usercityName = sessionStorage.gpscityName;
              elem.on('click', function () {
                commonService.showWarnMessage("请先登录，设置多个城市的我的小区，才能选择城市！");
              });
              break;
          }

        }).error(function () {
        });

        elem.on('change', function () {
          sessionStorage.gpscityId = $scope.usercityId;
          var txt = elem.find("option:selected").text();
          sessionStorage.gpscityName = txt;
          window.location.reload();
        })
      } else {
        $scope.citySelect = false;
        elem.on('click', function () {
          commonService.showWarnMessage("请先登录，设置多个城市的我的小区，才能选择城市！");
        })

      }

    }
  }

});

appDirective.directive('shopTab', function ($cookies, commonService, $state) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      if ($scope.$last) {
        $scope.shoppingPromise.then(function (data) {
          if ($scope.from == '%comservice%') {
            $('.shopping-segment-control a:first-child').css({
              'color': '#7DB343',
              'border-bottom': '3px solid #7DB343'
            });
          } else if ($scope.from == '%guanggao%') {
            var tabItem = $cookies.get('name');
            var tabIndex;
            $.each(data, function (index, info) {
              if (info.name == tabItem) {
                tabIndex = index;
                return false;
              }
            });
            if (tabIndex != undefined) {
              var childItems = $('.shopping-segment-item');
              $('.shopping-segment-item').css({
                'color': '#333',
                'border-bottom': 'none'
              });
              $(childItems[tabIndex]).css({
                'color': '#7DB343',
                'border-bottom': '3px solid #7DB343'
              });
              $scope.marketShow(data[tabIndex]);
            } else {
              commonService.showWarnMessage('在线超市的' + tabItem + '选项卡不存在！');
              $state.go(localStorage.adRoute);
              $cookies.put('from', 'toBack');
            }
          }


          //选项卡(至少两个选项)未超过设备宽度时，平分设备宽度
          var deviceW = $(window).width();
          var childTotalWidth = 0;
          var itemLength = 0;
          $.each($('.shopping-segment-item'), function (index, domElem) {
            childTotalWidth += $(domElem).outerWidth(true);
            itemLength += 1;
          });

          var dValue = deviceW - childTotalWidth;
          if (dValue > 0 && itemLength > 1) {
            var unitValue = parseInt(dValue / itemLength);
            $.each($('.shopping-segment-item'), function (index, domElem) {
              var curWidth = $(domElem).outerWidth() + unitValue;
              $(domElem).css('width', curWidth + 'px');
            });
          }


        });
      }


      elem.on('click', function () {
        $('.shopping-segment-item').css({
          'color': '#333',
          'border-bottom': 'none'
        });
        elem.css({
          'color': '#7DB343',
          'border-bottom': '3px solid #7DB343'
        });
      });
    }
  }
});
//固定卡头
//固定卡头宽度和样式
appDirective.directive('fixedTab', function ($rootScope) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var count = $scope.$eval(attr.data).count;
      var tab = $('li');
      $(tab).css({
        'width': $rootScope.width / count + 'px'
      });
      elem.on('click', function (event) {
        var tar = event.target;
        $scope.tar = $(tar).text();
        var tarSiblings = $(tar).siblings();
        $(tar).addClass('cartHead');
        tarSiblings.removeClass('cartHead')
      })
    }
  }
});

//长按图片 --- 删除图片
appDirective.directive('longPress', function ($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var ulElem = document.getElementsByClassName('weui_uploader_files')[0];
      var domElem = document.getElementsByClassName('weui_uploader_files')[0];
      domElem.addEventListener('touchstart', pressStart);
      domElem.addEventListener('touchmove', pressMove);
      domElem.addEventListener('touchend', pressEnd);

      var timer = 0;
      var isClick = true;

      function pressStart(event) {
        var touch = event.touches[0];
        var target = event.target;
        timer = $timeout(function () {
          isClick = false;
          longPress(target);
        }, 1000);
      };

      function pressMove(event) {
        $timeout.cancel(timer);
        timer = 0;
      }

      function pressEnd(event) {
        $timeout.cancel(timer);
        if (timer != 0) {

        }
        return false;
      }

      function longPress(target) {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '20px';
        div.style.height = '20px';
        div.style.top = '0px';
        div.style.right = '0px';
        div.style.backgroundColor = 'red';
        div.style.lineHeight = '20px';
        div.style.textAlign = 'center';

        var img = document.createElement('img');
        img.src = '../images/del.png';
        img.style.width = '50%';
        div.appendChild(img);

        if (target.nodeName == 'LI') {
          target.appendChild(div);
        } else if (target.nodeName == 'IMG') {
          target.parentNode.appendChild(div);
        }
        img.addEventListener('click', function () {
          if (target.nodeName == 'LI') {
            ulElem.removeChild(target);
          } else if (target.nodeName == 'IMG') {
            ulElem.removeChild(target.parentNode);
          }
        });

        target.addEventListener('click', function (event) {
          var target = event.target;
          if (target.nodeName == 'LI' && target.childNodes.length > 0) {
            target.removeChild(target.childNodes[0]);
          } else if (target.nodeName == 'IMG') {
            var targetParent = target.parentNode;
            var isContinue = false;
            $.each(targetParent.childNodes, function (index, info) {
              if (info.nodeName == 'DIV') {
                isContinue = true;
              }
            });
            if (isContinue) {
              targetParent.removeChild(targetParent.lastChild);
            }

          }
        });

      }
    }
  }
});

//修改头像
appDirective.directive('deleteHeadimg', function ($timeout, userService, $rootScope) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      function editHeadImgurlFun(param) {
        userService.editHeadImgurl(param).success(function (data) {
          $scope.result = data;

          switch ($scope.result.code) {
            case '0':
              window.location.reload();
              break;
            case '-1':
              commonService.showWarnMessage("参数为空！");
              break;
            case '-2':
              commonService.showWarnMessage("参数错误！");
              break;
          }
        }).error(function (data, status, header, config) {
        });
      }

      var domElem = document.getElementsByClassName('weui_uploader_files')[0];
      var imgBoxElem = document.getElementsByClassName('imgBox')[0];

      domElem.addEventListener('touchstart', pressStart);
      domElem.addEventListener('touchmove', pressMove);
      domElem.addEventListener('touchend', pressEnd);

      var timer = 0;
      var isClick = true;

      function pressStart(event) {
        var touch = event.touches[0];
        var target = event.target;
        //if (target.nodeName == 'INPUT') {
        //
        //  //上传头像
        //  $('.js_file').on('change', function (event) {
        //    var file = event.target.files;
        //    var reader = new FileReader();
        //    reader.readAsDataURL(file[0]);
        //    reader.onload = function (e) {
        //      var img = new Image();
        //      img.src = e.target.result;
        //
        //      var num = img.src.indexOf(',');
        //      var a = img.src.substring(num);
        //
        //      var newImg = document.createElement("img");
        //      newImg.setAttribute("id", "ordImg");
        //      newImg.src = img.src;
        //
        //      $('#ordImg').replaceWith(newImg);
        //
        //      $rootScope.newheadImgurl = a;
        //
        //      if ($rootScope.newheadImgurl != null) {
        //        var param = {
        //          'mobile': $rootScope.mobile,
        //          'headImgurl': $rootScope.newheadImgurl
        //        };
        //        editHeadImgurlFun(param);
        //      }
        //    };
        //  });
        //}

        timer = $timeout(function () {
          isClick = false;
          longPress(target);
        }, 1000);
      }

      function pressMove(event) {
        $timeout.cancel(timer);
        timer = 0;
      }

      function pressEnd(event) {
        $timeout.cancel(timer);
        if (timer != 0) {

        }
        return false;
      }

      function longPress(target) {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.width = '20px';
        div.style.height = '20px';
        div.style.top = '0px';
        div.style.right = '0px';
        //div.style.backgroundColor = 'red';
        div.style.lineHeight = '20px';
        div.style.textAlign = 'center';
        div.style.color = 'red';
        div.innerHTML = 'X';
        div.style.fontSize = '25px';

        /*var img = document.createElement('img');
         img.src = '../images/del.png';
         img.style.width = '50%';
         div.appendChild(img);*/
        imgBoxElem.appendChild(div);

        div.addEventListener('click', function () {

          var param = {
            'mobile': $rootScope.mobile,
            'headImgurl': 'default'
          };
          editHeadImgurlFun(param);
        });

        target.parentNode.addEventListener('click', function (e) {
          window.event ? window.event.cancelBubble = true : e.stopPropagation();
          $(div).remove();
        });
      }
    }
  }
});


//修改首页未读数量，超过99;则，修改样式
appDirective.directive('changeStyle', function ($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      $scope.countPromise.then(function (data) {
        if (data.coupons >= 100) {
          $timeout(function () {
            $('.coupons-badge').css({
              'width': 'auto',
              'padding': '0px 5px'
            });
          }, 100);
        }
        if (data.message >= 100) {
          $timeout(function () {
            $('.message-badge').css({
              'width': 'auto',
              'padding': '0px 5px'
            });
          }, 100);
        }
        if (data.cart >= 100) {
          $timeout(function () {
            $('.cart-badge').css({
              'width': 'auto',
              'padding': '0px 5px'
            });
          }, 100);
        }
        if (data.order >= 100) {
          $timeout(function () {
            $('.order-badge').css({
              'width': 'auto',
              'padding': '0px 5px'
            });
          }, 100);
        }
      });
    }
  }
});

//跳转到公共服务时，记住卡头状态
appDirective.directive('publicTab', function ($cookies) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      if ($scope.from == '%guanggao%' || $scope.from == 'wuye') {
        $scope.promise.then(function (data) {
          var aItems = $('.publicservice-segmentcontrol a');
          aItems.css({
            'border-bottom': '3px solid transparent',
            'color': '#666'
          });
          $(aItems[Number($scope.tabIndex)]).css({
            'border-bottom': '3px solid #7DB343',
            'color': '#7DB343'
          });

        });
      }

      if ($scope.$last) {
        $scope.promise.then(function (data) {
          if (data.length == 2) {
            $('.publicservice-sc-item').css('width', '50%');
          }
          if (data.length == 3) {
            $('.publicservice-sc-item').css('width', '33.3%');
          }
        });
      }
    }
  }
});

//我的消息列表记住滚动位置
appDirective.directive('msgTop', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      /*
       * $scope.$last : ngRepeat的最后一个元素加载完成后为true
       * */
      if ($scope.$last && localStorage.skip == 'msgDetail') {
        $scope.msgPromise.then(function (data) {
          if (localStorage.showType == '0') {
            $('.unread-message-table').scrollTop(Number(localStorage.scrollTop));
          } else if (localStorage.showType == '1') {
            $('.readed-msg').scrollTop(Number(localStorage.scrollTop));
          }
          $scope.params.pagesize = localStorage.pagesize;
          localStorage.removeItem('scrollTop');
          localStorage.removeItem('pageno');
          localStorage.removeItem('pagesize');
          localStorage.skip = 'comservice';
        });
      }
    }
  }
});

appDirective.directive('welfareHeight', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      $('.contentArea').css({
        'overflow': 'scroll',
        'height': localStorage.welfareH + 'px'
      });
    }
  }
});

appDirective.directive('goodsdetailImg', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      document.getElementById('goodsDescriptionNo').innerHTML = $scope.goodsDetailDescription;
      $(elem).find('img').css('width','100%');
    }
  };
});

/**
 * 电话日志
 */
appDirective.directive('callLogs', function (commonService, $cookies, $location) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attrs) {
      //解决因为ng-bind-html找不到a标签
      var params = null;
      if ($location.$$path == '/service/goodsDetail.htm' && $scope.goods.fuwu_name == '商家福利') {
        document.getElementById('goodsDescription').innerHTML = $scope.goodsDetailDescription;
        $(elem).find('a').bind('click', function () {
          //获得a href
          var tel = this.href;
          doLogs(this, tel);
        });
        $(elem).find('img').css('width', '100%');
      }
      else if ($location.$$path == '/guanjia/familyaccountdetail.htm') {
        var accountCall = $scope.$watch('accountDetaildescription', function (newValue, oldValue, scope) {
          if (typeof newValue != 'undefined') {
            //document.getElementById('goodsDescription').innerHTML = $scope.accountDetaildescription;
            accountCall();
            params = $scope.$eval(attrs.data);
            $(elem).find('a').bind('click', function () {
              //获得a href
              var tel = this.href;
              doLogs(this, tel);
            });
          }
        });
      } else {
        params = $scope.$eval(attrs.data);
        if (params.isSplit) {
          $(elem).find('a').bind('click', function () {
            //获得a href
            var tel = this.href;
            doLogs(this, tel);
          });
        } else {
          //需要分割的。telArrary有遍历完后
          setTimeout(function () {
            $(elem).find('a').bind('click', function () {
              //获得a href
              params = $scope.$eval(attrs.data);
              var tel = this.href;
              doLogs(this, tel);
            });
          }, 500);

        }
      }
      var doLogs = function (_this, tel) {
        //如果包含tel
        if (tel.indexOf('tel') != -1) {
          var logs = commonService.setCallLogs;
          //电话号码
          logs.mobile = _this.innerText;
          //电话类型
          logs.type = params.type;
          //电话归属
          if (params.telBelong.indexOf('$scope') != -1) {
            logs.telBelong = eval("(" + params.telBelong + ")");
          } else {
            console.log(params);
            logs.telBelong = params.telBelong;
          }
          if (params.page2) {
            params.page += eval("(" + params.page2 + ")")
          }
          logs.page = params.page;
          logs.city_id = sessionStorage.gpscityId;
          logs.ticket = $cookies.get('ticket');
          if (params.business_id && params.business_id.indexOf('$scope') != -1) {
            logs.business_id = eval("(" + params.business_id + ")");
          } else if (params.business_id) {
            logs.business_id = params.business_id;
          }
          commonService.addCallLog(logs);
        }
      };
    }
  };
});
appDirective.directive('tabPortfolio', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var width = $(document).width();
      var len = $(elem).find('li').length;
      var wid = 320 / 4;
      $(elem).css('width', wid * len + 'px');
      $(elem).find('li').css('width', wid + 'px')
    }
  }
});
/**
 * 设计导航滑动
 * @author sun
 */
appDirective.directive('tabScroll', function () {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      var length;
      var typeWatch = $scope.$watch('fuwu_id', function (newValue, oldValue, scope) {
        if (typeof newValue != 'undefined') {
          length = newValue.length;
          typeWatch();
          if (length >= 4) {
            var temp = $(elem).children(':first').find('a').css('width');
            var tabWidth = temp.substr(0, temp.length - 2);
            //总长度（也算上css边距）具体请看使用此指令元素的CSS
            var totalWidth = tabWidth * length + 20 + (length - 1) * 5;
            var screenWidth = $(window).width();
            if (totalWidth > screenWidth) {
              //如果说总长度大于屏幕宽度，那就让此父元素宽度与子元素总长度对等
              $(elem).css('width', totalWidth + 'px');
            }
          }
        }
      });

    }
  };
});

/**
 * 分割电话号码，返回数组
 */
appDirective.directive('telSplit', function ($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, elem, attr) {
      $timeout(function () {
        var data = $scope.$eval(attr.data).telStr;
        if (data != '') $scope.telArray = data.split(',');
      }, 100);
    }
  }
});

/**
 * 控制城市定位的宽度
 */

appDirective.directive('cityHeight', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attr) {
      var cityName = sessionStorage.gpscityName;
      if (typeof cityName != 'undefined' && cityName.length >= 3) {
        $(elem).css('width', '66px');
      }
      $(elem).on('change', function (e) {
        if ($(elem).find('option').eq(this.selectedIndex).text().length >= 3) {
          $(elem).css('width', '66px');
          if ($(window).width() <= 340) {
            $('.navcityText').css('width', '65%');
          }
        } else {
          $(elem).css('width', '50px');
        }
      });
    }
  };
});
