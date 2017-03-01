'use strict';

var authService = angular.module('authService', []);

/**
 * 身份认证和授权服务
 */
authService.factory('authService',
    function ($http, $state, $location, $q, AUTH_PAGES, storageService, commonService) {

        var authService = {};

        authService.login = function (credentials) {
            var url = commonService.getBaseParams().url + 'datas/user/detail.json';
            return commonService.handleSyncData(url, credentials)//处理登录信息
                .then(function (data) {
                    if (data !== null && data.user !== null) {
                        //登录后在授权页面中移除登录页
                        var roleResources = data.user.role.roleResources;
                        roleResources.splice(roleResources.indexOf(AUTH_PAGES.login), 1);
                        data.user.role.roleResources = roleResources;

                        //登录用户保存到缓存
                        storageService.createUserStorage(data.sessionId, data.user.id, data.user.role);

                        return data.user;//承诺处理（显示）登录信息
                    }
                });
        };

        authService.logout = function () {

        };

        authService.isAuthenticated = function (authorizedRole) {//是否认证
            return !!storageService.getStorage().userId;//用户缓存是及用户id否存在
        };

        authService.isNonAuthorization = function(currentPath) {//页面是否授权，非授权页面，游客可直接查看的页面(针对游客)
            var nonAuthorizedResources = [
                '/',
                '/login.htm',
                '/not-found.htm',
                '/blank/basic.htm',
                '/blank/list2.htm'
            ];

            if (!angular.isArray(nonAuthorizedResources)) {//可直接查看的页面资源列表
                nonAuthorizedResources = [nonAuthorizedResources];
            }

            return (nonAuthorizedResources.indexOf(currentPath) !== -1);
        };

        authService.isAuthorized = function (currentPath) {//页面是否授权，授权页面（针对用户）

            var authorizedRole = angular.fromJson(storageService.getStorage().userRole);//获取用户缓存中的其权限
            var authorizedRoleResources =  authorizedRole.roleResources;//权限资源列表

            if (!angular.isArray(authorizedRoleResources)) {//如果不是数组，转成数组形式，权限资源列表
                authorizedRoleResources = [authorizedRoleResources];
            }

            //当前页面是否在权限列表中
            return (authService.isAuthenticated() && authorizedRoleResources.indexOf(currentPath) !== -1);
        };

        //TODO 此方法需要独立到另外一个服务|指令中
        authService.permissionCheck = function (currentPath) {//特殊权限及其他情况的处理,一般都是登录后操作,

        };

        return authService;

    }
);

/**
 * angularjs自身的缓存，刷新后即会清空
 */
authService.service('cacheService',
    function ($cacheFactory) {
        var userCache = $cacheFactory('userCache');
        var service = {};

        service.createUserCache = function (sessionId, userId, userRole) {
            userCache.put('sessionId', sessionId);
            userCache.put('userId', userId);
            userCache.put('userRole', userRole);//这应该是一个对象
        };

        service.getUserCache = function () {
           return userCache;
        };

        service.destroyUserCache = function () {
            userCache.remove('sessionId');
            userCache.remove('userId');
            userCache.remove('userRole');//这应该是一个对象
        };

        service.destroy = function () {
            userCache.destroy();
        };

        return service;
    }
);

/**
 * H5的缓存，
 * sessionStorage浏览器新开标签后即会清空, 每在新标签或者新窗口中打开一个新页面，都会初始化一个新的会话
 * localStorage持久但是但是共享
 */
authService.service('storageService',
    function () {
        var storage = sessionStorage;
        //var storage = localStorage;

        var service = {};

        service.createUserStorage = function (sessionId, userId, userRole) {
            storage.setItem('sessionId', sessionId);
            storage.setItem('userId', userId);
            storage.setItem('userRole', angular.toJson(userRole));//这应该是一个对象,转成字符后才能保存
        };

        service.destroyUserStorage = function () {
            storage.removeItem('sessionId');
            storage.removeItem('userId');
            storage.removeItem('userRole');//这应该是一个对象
        };

        service.getStorage = function () {
            return angular.fromJson(storage);
        };

        service.clear = function () {
            storage.clear();
        };

        return service;
    }
);
