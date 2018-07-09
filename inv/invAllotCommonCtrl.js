/**
 * Created by leo01.zhu on 2016/7/25.
 */

'use strict';
/**
 * controller for 普通调拨单
 */
app.controller('invAllotCommonCtrl', ["$scope", "$state", "$timeout", "SweetAlert","$translate", "$stateParams","$filter","sysGpService", function ($scope, $state, $timeout, SweetAlert, $translate, $stateParams,$filter,sysGpService) {

    // =============================================================页面初始化===============================================
    var vm = $scope.vm = {};
    var queryModel = $scope.queryModel = {};
    queryModel.pageNo = 1;
    queryModel.pageSize = 10;
    var pageModel = $scope.pageModel = {};
    $scope.allocateList = [];

    // =============================================================按钮权限控制===============================================
    // 根据session会话中的用户id获取用户角色
    // 根据画面号获取该画面号下button数据，含授权信息,后期服务方式实现
    var queryButtons = function(pageCode){

        var buttons = [];

        var button = {
            id: '0',
            class: 'btn btn-primary',
            value: $translate.instant("framework.PREV"),
            method: 'prev',
            hasAuth: true
        };
        buttons.push(button);


        var button = {
            id: '0',
            class: 'btn btn-primary',
            value: $translate.instant("framework.NEXT"),
            method: 'next',
            hasAuth: true
        };
        buttons.push(button);


        var button = {
            id: '0',
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
    sysGpService.setButtons($scope.buttons,['next','allocate']);

    $scope.buttonClick = function(method){

        var id = $('ul > li.ng-isolate-scope.active').attr('id');

        if(method == 'query'){
            $scope.queryData();
        }
        if(method == 'prev'){
            vm.prev_step();
        }
        if(method == 'next'){
            vm.next_step();
        }
        if(method == 'allocate'){
            $scope.allocate();
        }

    };


    //数据字典

    $scope.data = [{
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


    $scope.salesStatus = [
        {
            "codeValue": "0",
            "codeName": "否"
        },
        {
            "codeValue": "1",
            "codeName": "是"
        }
    ];

    //查询列表
    $scope.queryData = function(){

        sysGpService.CRUD('/data/inb/alloc/inventory/details','POST',$scope.queryModel).success(function(result) {
            if(result.result){
                $scope.resultList = result.data.inventoryDetailList;
                //pageModel.totalCount = result.data.totalCount;
                //pageModel.pageCount = Math.ceil(pageModel.totalCount / queryModel.pageSize);

                ////控制layout
                //vm.statistic = true;
                //$scope.buttons[2].hasAuth = true;
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
                "clientCode": "货主代码",
                "clientName": "货主名称",
                "itemCode": "条码",
                "itemName": "品名",
                "isAirlineBanProducts": "航空禁运",
                "poNo": "PO",
                "salesNo": "销售档期号",
                "salesStatus": "销售状态",
                "inventoryType": "库存类型",
                "inventoryQuality": "库存质量",
                "mfgDate": "生产日期",
                "expDate": "到期日期",
                "onHandQty": "库存数",
                "allocatedQty": "分配数",
                "frozenQty": "冻结数量",
                "availableQty": "10"

            }
        ];

        for(var i=0;i<2;i++){
            var result = angular.copy($scope.resultList[0]);

            result.clientCode = result.clientCode + i;

            $scope.resultList.push(result);
        }

    };


    //调拨
    $scope.allocate = function(){

        if($scope.allocateList.length < 1){
            SweetAlert.swal({
                title : $translate.instant("inv_allot_common.ARECORD"),
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            return false;
        }

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

        $scope.queryModel = {};
        vm.step = 1;
        sysGpService.setButtons($scope.buttons,['next']);

    };

    vm.prev_step = function(){

        vm.step = vm.step - 1;
        if(vm.step == 1){
            sysGpService.setButtons($scope.buttons,['next']);
        }
        if(vm.step == 2){
            sysGpService.setButtons($scope.buttons,['prev','next']);
        }

        if(vm.step == 3){
            sysGpService.setButtons($scope.buttons,['prev','next']);
        }
    };

    vm.next_step = function(){
        if(queryModel.toWarehouseCode == undefined){
            SweetAlert.swal({
                title : $translate.instant("inv_allot_common.PTARGETWH"),
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            return false;
        }
        if(queryModel.itemCode == undefined && vm.step > 1){

            SweetAlert.swal({
                title : $translate.instant("inv_allot_common.PITEMCODE"),
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            angular.element(document).find('#itemCode').focus();
            return false;
        }

        if(vm.step == 1){
            sysGpService.setButtons($scope.buttons,['prev','next']);
        }

        if(vm.step == 2){
            $scope.queryData();
            sysGpService.setButtons($scope.buttons,['prev','next']);
        }
        if(vm.step == 3){

            //调拨数校验
            for(var i=0;i<$scope.resultList.length;i++){
                var result = $scope.resultList[i];
                if(result.transQty - result.availableQty > 0){
                    SweetAlert.swal({
                        title : $translate.instant("inv_allot_common.CHECKNUM"),
                        text : "I will close in 2 seconds.",
                        timer : 2000,
                        showConfirmButton : false
                    });
                    return false;
                }
            }

            $scope.allocateList = [];
            angular.forEach($scope.resultList,function(result,index){
                if(result.transQty > 0 || result.transQty < 0){
                    result.toWarehouseCode = queryModel.toWarehouseCode;
                    $scope.allocateList.push(result);
                }
            });
            sysGpService.setButtons($scope.buttons,['prev','allocate']);
        }

        vm.step = vm.step + 1;

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
            result.$checked = false;
            if (index == idx) {
                result.$checked = true;
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
