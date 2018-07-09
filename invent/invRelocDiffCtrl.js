/**
 * Created by leo01.zhu on 2016/7/18.
 */

'use strict';
/**
 * controller for 移库差异确认
 */
app.controller('invRelocDiffCtrl', ["$scope", "$state", "$timeout", "SweetAlert","$translate", "$stateParams","$filter","sysGpService", function ($scope, $state, $timeout, SweetAlert, $translate, $stateParams,$filter,sysGpService) {

    // =============================================================页面初始化===============================================
    var vm = $scope.vm = {};
    var queryModel = $scope.queryModel = {};
    queryModel.pageNo = 1;
    queryModel.pageSize = 10;
    var pageModel = $scope.pageModel = {};
    $scope.DataModel = [];

    // =============================================================按钮权限控制===============================================
    // 根据session会话中的用户id获取用户角色
    // 根据画面号获取该画面号下button数据，含授权信息,后期服务方式实现
    var queryButtons = function(pageCode){

        var buttons = [];
        var button = {
            id: '0',
            class: 'btn btn-primary',
            value: $translate.instant("button.QUERY"),
            method: 'query',
            hasAuth: true
        };
        buttons.push(button);

        button = {
            id: '3',
            class: 'btn btn-primary',
            value: $translate.instant("button.RESET"),
            method: 'reset',
            hasAuth: true
        };
        buttons.push(button);

        button = {
            id: '2',
            class: 'btn btn-primary',
            value: $translate.instant("button.LOSSES"),
            method: 'losses',
            hasAuth: true
        };
        buttons.push(button);

        return buttons;

    };

    //后台根据用户id获取角色，进而获取button数据
    $scope.buttons = queryButtons('pageCode');

    //画面逻辑处理按钮是否可读
    $scope.buttons[2].hasAuth = false;

    $scope.buttonClick = function(method){

        var id = $('ul > li.ng-isolate-scope.active').attr('id');

        if(method == 'query'){
            $scope.queryData();
        }

        if(method == 'new'){
            $scope.DataModel = [];
            vm.modify = true;
        }

        if(method == 'reset'){
            $scope.queryModel = {};
            $scope.queryModel.pageNo = 1;
            $scope.queryModel.pageSize = 10;
            $scope.pageModel = {};
            $scope.resultList = [];
            vm.condition = true;
        }

        if(method == 'save' && id == 'EDIT'){
            $scope.saveData();
        }

        if(method == 'delete'){

        }

        if(method == 'losses' && id == 'LIST'){
            $scope.losses();
        }

    };


    //数据字典
    //DIFF_STATUS
    $scope.diffStatus = [
        {
            "codeValue": "100",
            "codeName": "新建"
        },
        {
            "codeValue": "900",
            "codeName": "已处理"
        },
        {
            "codeValue": "999",
            "codeName": "已处理"
        }
    ];

    //查询列表
    $scope.queryData = function(){

        sysGpService.CRUD('/data/invent/reloc_diff/query','POST',$scope.queryModel).success(function(result) {
            if(result.result){
                $scope.resultList = result.data.invRelocDiffList;
                pageModel.totalCount = result.data.totalCount;
                pageModel.pageCount = Math.ceil(pageModel.totalCount / queryModel.pageSize);

                //控制layout
                vm.statistic = true;
                $scope.buttons[2].hasAuth = true;
            }else{
                SweetAlert.swal({
                    title : result.msg,
                    type : "error"
                });
            }
        }).error(function(data) {
            SweetAlert.swal({
                title : data,
                type : "error",
                confirmButtonColor : "#007AFF"
            });
        });

        $scope.resultList = [
            {
                "invRelocDiffId": "主键",
                "fromLocation": "来源货位",
                "toLocation": "目标货位",
                "fromContainer": "来源箱",
                "toContainer": "目标箱",
                "diffClientCode": "货主代码",
                "diffItemCode": "条码",
                "diffItemName": "品名",
                "createdByUser": "移库人",
                "diffUserName": "确认人",
                "inv_qty": "库存数",
                "diffQty": "差异数量",
                "statusCode": "状态",
                "createdDtmLoc": "创建时间",
                "diffTime": "处理时间"
            }
        ];
        var result = angular.copy($scope.resultList[0]);
        result.invRelocDiffId = "主键1";
        $scope.resultList.push(result);
        result = angular.copy($scope.resultList[0]);
        result.invRelocDiffId = "主键2";
        $scope.resultList.push(result);
        result = angular.copy($scope.resultList[0]);
        result.invRelocDiffId = "主键3";
        $scope.resultList.push(result);
        result = angular.copy($scope.resultList[0]);
        result.invRelocDiffId = "主键4";


        $scope.resultList[0].statusCode = '100';
        $scope.resultList[1].statusCode = '100';
        $scope.resultList[2].statusCode = '900';

        pageModel.totalCount = 32;
        pageModel.pageCount = Math.ceil(pageModel.totalCount / $scope.queryModel.pageSize);

        vm.statistic = true;
        $scope.buttons[2].hasAuth = true;

    };


    //盘亏
    $scope.losses = function(){

        var invRelocDiffId = [];
        angular.forEach($scope.resultList, function(result) {
            if (result.$checked) {
                invRelocDiffId.push(result.invRelocDiffId);
            }
        });
        if(invRelocDiffId.length < 1){
            SweetAlert.swal({
                title : "请至少选择一条差异记录",
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            return false;

        }
        var queryModel = {};
        queryModel.invRelocDiffId = invRelocDiffId.toString();

        sysGpService.CRUD('/data/invent/reloc_diff/losses','POST',queryModel).success(function(result) {
            if(result.result){
                SweetAlert.swal({
                    title : result.msg,
                    type : "success",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                }, function(isConfirm) {
                    $scope.queryData();
                 });
            }else{
                SweetAlert.swal({
                    title : result.msg,
                    type : "error"
                });
            }
        }).error(function(data) {
            SweetAlert.swal({
                title : data,
                type : "error",
                confirmButtonColor : "#007AFF"
            });
        });
        $scope.queryData();
        $scope.resultList = [
            {
                "invRelocDiffId": "主键",
                "fromLocation": "来源货位",
                "toLocation": "目标货位",
                "fromContainer": "来源箱",
                "toContainer": "目标箱",
                "diffClientCode": "货主代码",
                "diffItemCode": "条码",
                "diffItemName": "品名",
                "createdByUser": "移库人",
                "diffUserName": "确认人",
                "inv_qty": "库存数",
                "diffQty": "差异数量",
                "statusCode": "状态",
                "createdDtmLoc": "创建时间",
                "diffTime": "处理时间"
            }
        ];


    };

    // 全选
    vm.checkAll = function(checked) {
        angular.forEach($scope.resultList, function(result) {
            result.$checked = checked;
        });
    };

    // checkbox单选功能
    vm.resultCheckOnebox = function(index) {
        angular.forEach($scope.resultList, function(result, idx) {
            if(index == idx) {
            }else{
                result.$checked = false;
            }
        });
    };

    // 分页
    $scope.pageModel.change = function(pageSize) {
        $scope.queryModel.pageNo = 1;
        $scope.queryModel.pageSize = pageSize;
        $scope.queryData();
    };
    $scope.pageModel.firstPage = function() {
        if ($scope.queryModel.pageNo != 1) {
            $scope.queryModel.pageNo = 1;
            $scope.queryData();
        }
    };
    $scope.pageModel.prevPage = function() {
        if ($scope.queryModel.pageNo > 1) {
            $scope.queryModel.pageNo = $scope.queryModel.pageNo - 1;
            $scope.queryData();
        }
    };
    $scope.pageModel.nextPage = function() {
        if ($scope.queryModel.pageNo < $scope.pageModel.pageCount) {
            $scope.queryModel.pageNo = $scope.queryModel.pageNo + 1;
            $scope.queryData();
        }
    };
    $scope.pageModel.lastPage = function() {
        if ($scope.queryModel.pageNo != $scope.pageModel.pageCount) {
            $scope.queryModel.pageNo = $scope.pageModel.pageCount;
            $scope.queryData();
        }
    };

}]);



