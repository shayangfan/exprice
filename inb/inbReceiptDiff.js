/**
 * Created by leo.zhu on 2016/7/21.
 */

'use strict';
/**
 * controller for 入库差异确认
 */
app.controller('inbReceiptDiff', ["$scope", "$state", "$timeout", "SweetAlert","$translate", "$stateParams","$filter","sysGpService", function ($scope, $state, $timeout, SweetAlert, $translate, $stateParams,$filter,sysGpService) {

    // =============================================================页面初始化===============================================
    var vm = $scope.vm = {};
    var queryModel = $scope.queryModel = {};
    queryModel.pageNo = 1;
    queryModel.pageSize = 10;
    var pageModel = $scope.pageModel = {};

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
            id: '2',
            class: 'btn btn-primary',
            value: $translate.instant("inv_receipt_diff.CLOSE"),
            method: 'close',
            hasAuth: true
        };
        buttons.push(button);

        button = {
            id: '5',
            class: 'btn btn-primary',
            value: $translate.instant("framework.EXPORT"),
            method: 'export',
            hasAuth: true
        };
        buttons.push(button);

        button = {
            id: '1',
            class: 'btn btn-primary',
            value: $translate.instant("button.SAVE"),
            method: 'save',
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
        return buttons;

    };

    //后台根据用户id获取角色，进而获取button数据
    $scope.buttons = queryButtons('pageCode');

    //按钮设置
    //Input ['query','save'] methodList
    $scope.setButtons = function(methodList){
        angular.forEach($scope.buttons,function(button){
            button.hasAuth = false;
        });
        angular.forEach($scope.buttons,function(button){
            angular.forEach(methodList,function(method){
                if(button.method == method){
                    button.hasAuth = true;
                }
            });
        });
    };

    $scope.setButtons(['query','reset']);

    $scope.buttonClick = function(method){
        var id = $('ul > li.ng-isolate-scope.active').attr('id');
        if(method == 'query'){
            $scope.queryData();
        }
        if(method == 'new'){
            vm.modify = true;
        }
        if(method == 'reset'){
            $scope.queryModel = {};
            $scope.queryModel.pageNo = 1;
            $scope.queryModel.pageSize = 10;
            $scope.pageModel = {};
            $scope.resultList = [];
            $scope.diffList = [];
            vm.condition = true;
        }
        if(method == 'save' && id == 'EDIT'){
            $scope.saveData();
        }
        if(method == 'delete'){

        }
        if(method == 'export'){
            var param = {};
            param.tableid = 'result';
            param.xlsName = '入库明细表.xls';
            vip.exportExcel(param);
        }
        if(method == 'close' && id == 'LIST'){
            $scope.closeContainer();
        }
    };

    //获取代码数据字典数据
    var params = {};
    params.typeCodes = ['Opt_sign','connectors','brackets','Lot_field'];
    sysGpService.CRUD('/data/sys/codeDict/listByTypeCode','GET',params).success(function(result) {
        if(result.result){
            $scope.statusCodes = sysGpService.getListFromListByKey(result.data, "typeCode", "Lot_field");
            $scope.receipTypes = sysGpService.getListFromListByKey(result.data, "typeCode", "brackets");
        }
    });

    //数据字典
    $scope.statusCodes = [
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

    //入库单类型
    $scope.receipTypes = [
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

        sysGpService.CRUD('/data/inb/receiptContainer/query','POST',$scope.queryModel).success(function(result) {
            if(result.result){
                $scope.resultList = result.data.resultList;
                pageModel.totalCount = result.data.totalCount;
                pageModel.pageCount = Math.ceil(pageModel.totalCount / queryModel.pageSize);

                vm.statistic = true;

                $scope.setButtons(['query','reset','export','close']);
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
                "poNo":"PO单号11",
                "receiptNo":"入库单号",
                "palletCode":"车托号",
                "fromContainerCode":"来源容器",
                "clientCode":"货主",
                "itemCode":"条码",
                "itemDesc":"品名",
                "companyCode":"品牌",
                "scanQty":"IQC数",
                "checkQty":"库存数",
                "difQty":"差异数",
                "type":"入库单类型",
                "status":"容器状态",
                "scanPerson":"扫描人"
            }
        ];

        pageModel.totalCount = 32;
        pageModel.pageCount = Math.ceil(pageModel.totalCount / queryModel.pageSize);

        vm.statistic = true;
        $scope.setButtons(['query','export','close']);

    };

    //强制关箱
    $scope.closeContainer = function(){
        var result = vm.tabValidate($scope.resultList,'fromContainerCode');
        var queryModel = {};
        queryModel.fromContainerCode = result.primarykey;
        sysGpService.CRUD('/data/inb/receiptContainer/close','POST',queryModel).success(function(result) {
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
    };

    //跳转差异Tab
    $scope.editData = function(primarykey){

        var queryModel = {};
        queryModel.fromContainerCode = primarykey;

        sysGpService.CRUD('/data/inb/receiptContainer/detail','POST',queryModel).success(function(result) {
            if(result.result){
                $scope.diffList = result.data.receiptDetailList;
                $scope.setButtons(['query','save']);
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

        $scope.diffList = [
            {
                "itemCode": "条码EDIT1",
                "itemName": "品名",
                "fromContainerCode": "来源容器",
                "toLocationCode": "上架库位",
                "optUserCode": "上架人",
                "optTime": "上架时间",
                "optQty": "上架数",
                "confirmQty": "复合数"
            }, {
                "itemCode": "条码EDIT2",
                "itemName": "品名",
                "fromContainerCode": "来源容器",
                "toLocationCode": "上架库位",
                "optUserCode": "上架人",
                "optTime": "上架时间",
                "optQty": "上架数",
                "confirmQty": "复合数"
            }
        ];

        $scope.setButtons(['query','save']);

    };

    //保存
    $scope.saveData = function(){

        sysGpService.CRUD('/data/inb/receiptContainer/save','POST',$scope.diffList).success(function(result) {
            if(result.result){
                $scope.diffList = result.data.receiptDetailList;

                $scope.editData($scope.primarykey);
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

        $scope.diffList = [
            {
                "itemCode": "条码EDIT11111",
                "itemName": "品名",
                "fromContainerCode": "来源容器",
                "toLocationCode": "上架库位",
                "optUserCode": "上架人",
                "optTime": "上架时间",
                "optQty": "上架数",
                "confirmQty": "复合数2222"
            }, {
                "itemCode": "条码EDIT22222",
                "itemName": "品名",
                "fromContainerCode": "来源容器",
                "toLocationCode": "上架库位",
                "optUserCode": "上架人",
                "optTime": "上架时间",
                "optQty": "上架数",
                "confirmQty": "复合数11111"
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

    //编辑Tab
    vm.edit = function(){
        var result = vm.tabValidate($scope.resultList,'fromContainerCode');
        if(result.result == false){
            vm.statistic = true;
        }else{
            $scope.primarykey = result.primarykey;
            $scope.editData($scope.primarykey);
        }
    };

    //数据Tab
    vm.list = function(){
        $scope.setButtons(['query','export','close']);
    };

    //查询Tab
    vm.query = function(){
        $scope.setButtons(['query','reset']);
    };

    //前端Tab按钮校验
    // Input list,key
    // Output = {result,index,primarykey}
    vm.tabValidate = function(recordList,primarykey){
        var result = {};
        angular.forEach(recordList, function(record,index) {
            if (record.$checked == true) {
                result.primarykey = record[primarykey];
                result.result = true;
                result.index = index;
            }
        });
        if(result.primarykey === undefined){
            SweetAlert.swal({
                title : "请先勾选行!",
                text : "I will close in 2 seconds.",
                timer : 2000,
                showConfirmButton : false
            });
            result.result = false;
        }
        return result;
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



