/**
 * Created by leo01.zhu on 2016/7/19.
 */

'use strict';
/**
 * controller for RDC调拨生单
 */
app.controller('invAllotRdcCtrl', ["$scope", "$state", "$timeout", "SweetAlert","$translate", "$stateParams","$filter","sysGpService","$modal","$location","sysGpLocals", function ($scope, $state, $timeout, SweetAlert, $translate, $stateParams,$filter,sysGpService,$modal,$location,sysGpLocals) {

    // =============================================================页面初始化===============================================
    var vm = $scope.vm = {};
    var queryModel = $scope.queryModel = {};
    queryModel.pageNo = 1;
    queryModel.pageSize = 10;
    var pageModel = $scope.pageModel = {};

    // =============================================================按钮权限控制===============================================

    sysGpService.queryButtons($location);
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
            value: $translate.instant("framework.ALLOCATE"),
            method: 'allocate',
            hasAuth: true
        };
        buttons.push(button);

        return buttons;

    };

    //后台根据用户id获取角色，进而获取button数据
    $scope.buttons = queryButtons('pageCode');

    //画面逻辑处理按钮是否可读
    sysGpService.setButtons($scope.buttons,['query','reset']);

    $scope.buttonClick = function(method){

        var id = $('ul > li.ng-isolate-scope.active').attr('id');

        if(method == 'query'){
            $scope.queryData();
        }
        if(method == 'reset'){
            $scope.queryModel = {};
            $scope.queryModel.pageNo = 1;
            $scope.queryModel.pageSize = 10;
            $scope.pageModel = {};
            $scope.resultList = [];
            vm.condition = true;
            sysGpService.setButtons($scope.buttons,['query','reset']);
        }
        if(method == 'allocate'){
            $scope.allocate();
        }
    };


    //数据字典
    $scope.data = [
        {
            "codeValue": "0",
            "codeName": "否"
        },
        {
            "codeValue": "1",
            "codeName": "是"
        }
    ];

    $scope.warehouses = [{
        "codeValue": "100",
        "codeName": "华东仓"
    },
        {
            "codeValue": "900",
            "codeName": "华南仓"
        },
        {
            "codeValue": "999",
            "codeName": "华北仓"
        }];

    //查询列表
    $scope.queryData = function(){


        //日期格式化
        $scope.queryModel.CREATED_DTM_LOC = $filter('date')($scope.queryModel.CREATED_DTM_LOC,'yyyy-MM-dd');
        $scope.queryModel.UPDATED_DTM_LOC = $filter('date')($scope.queryModel.UPDATED_DTM_LOC,'yyyy-MM-dd');


        sysGpService.CRUD('/data/invent/reloc_diff/query','POST',$scope.queryModel).success(function(result) {
            if(result.result){
                $scope.resultList = result.data.invRelocDiffList;
                pageModel.totalCount = result.data.totalCount;
                pageModel.pageCount = Math.ceil(pageModel.totalCount / queryModel.pageSize);

                vm.statistic = true;
                sysGpService.setButtons($scope.buttons,['query','reset','allocate']);
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
                "REFERENCE_NO": "订单号",
                "ITEM_CODE": "货品编码",
                "SALES_NO": "销售档期号",
                "BRAND_DESC": "品牌",
                "ITEM_DESC": "描述",
                "isAirlineBanProducts": "航空禁运",
                "REQ_QTY": "需求数",
                "TO_WAREHOUSE": "目的仓",
                "REFERENCE_TYPE": "类型",
                "IS_RE_COMMAND": "是否补调拨",
                "RE_ALLOCATE_NUM": "调拨次数",
                "CREATED_DTM_LOC": "创建时间",
                "UPDATED_DTM_LOC": "最后更新时间"
            },            {
                "REFERENCE_NO": "订单号",
                "ITEM_CODE": "货品编码",
                "SALES_NO": "销售档期号",
                "BRAND_DESC": "品牌",
                "ITEM_DESC": "描述",
                "isAirlineBanProducts": "航空禁运1",
                "REQ_QTY": "需求数",
                "TO_WAREHOUSE": "目的仓",
                "REFERENCE_TYPE": "类型",
                "IS_RE_COMMAND": "是否补调拨",
                "RE_ALLOCATE_NUM": "调拨次数",
                "CREATED_DTM_LOC": "创建时间",
                "UPDATED_DTM_LOC": "最后更新时间"
            }
        ];

        pageModel.totalCount = 32;
        pageModel.pageCount = Math.ceil(pageModel.totalCount / $scope.queryModel.pageSize);

        vm.statistic = true;
        sysGpService.setButtons($scope.buttons,['query','reset','allocate']);

    };

    //调拨
    $scope.allocate = function(){

        $scope.allocateList = [];
        angular.forEach($scope.resultList,function(result,index){
            if(result.$checked){
                $scope.allocateList.push(result);
            }
        });

        if($scope.allocateList.length < 1){
            SweetAlert.swal({
                title : $translate.instant("inv_allot_rdc.ARECORD"),
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            return false;
        }

        //航空禁运品提示
        var size = 0;
        var isAirlineBanProducts = {};
        angular.forEach($scope.allocateList,function(record){
            isAirlineBanProducts[record.isAirlineBanProducts] = record.isAirlineBanProducts;
        });

        for (var key in isAirlineBanProducts) {
            size++;
        }
        if(size == 1){
            allocate();
        }
        if(size == 2){
            SweetAlert.swal({
                title: "Are you sure?",
                text: "",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: $translate.instant("inv_allot_rdc.ALLOCATE"),
                cancelButtonText: $translate.instant("framework.CANCEL"),
                closeOnConfirm: true,
                closeOnCancel: true
            }, function (isConfirm) {
                if (isConfirm) {
                    allocate();
                } else {
                    $scope.buttonClick('reset');
                    return false;
                }
            });
        }

    };

    function allocate(){

        sysGpService.CRUD('/data/inb/save/alloc/order','POST',$scope.allocateList).success(function(result) {
            if(result.result){
                SweetAlert.swal({
                    title : result.msg,
                    type : "success",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                }, function(isConfirm) {
                    $scope.queryModel = {};
                    vm.step = 1;
                    $scope.resultList = [];
                    $scope.allocateList = [];
                    sysGpService.setButtons($scope.buttons,['next']);
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

    }

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


    vm.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        vm.opened = !vm.opened;
    };

    vm.isopen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        vm.isopened = !vm.isopened;
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


    $scope.items = ['item1', 'item2', 'item3'];

    $scope.open = function (size) {

        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function () {
                    return $scope.items;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

}]);

app.controller('ModalInstanceCtrl', ["$scope", "$modalInstance", "items", function ($scope, $modalInstance, items) {

    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]);

function clickButton(){

    $('#myModal').modal('show');



}



