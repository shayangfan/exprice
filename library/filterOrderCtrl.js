'use strict';

app.controller('filterOrderCtrl', [ "$rootScope", "$scope", "$http", "$window", "$modal", "$filter", "SweetAlert", function($rootScope, $scope, $http, $window, $modal, $filter, SweetAlert) {
    $scope.templateInfo = {};
    var vm = $scope.vm = {};
    var channel = $scope.channel = {};
    var customer = $scope.customer = {};
    var condition = $scope.condition = {};
    var statistic = $scope.statistic = {};
    var modify = $scope.modify = {};

    // 弹出式日历触发函数
    vm.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        vm.opened = true;
        vm.toOpened = false;
    };

    vm.toOpen = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        vm.opened = false;
        vm.toOpened = true;
    };

    // 自定义选项
    vm.dateOptions = {
        formatYear : 'yy',
        startingDay : 1,
        formatDayTitle : 'yyyy-MM'
    };

    $scope.changeState = function(type) {
        if (type == 'condition') {
            statistic.active = false;
            modify.active = false;
        } else if (type == 'statistic') {
            condition.active = false;
            modify.active = false;
        } else {
            condition.active = false;
            statistic.active = false;
        }
    }

    /** 查询筛单模板信息 */
    $scope.searchConditon = {};
    $scope.queryFilterTemplate = function() {
        // 通过查询条件查询数据库
        var templateCode = $scope.searchConditon.templateCode;
        var templateName = $scope.searchConditon.templateName;
        $http.post("http://" + $rootScope.domain + "/query/filter/template", {
            'oubEiqTemplateCode' : templateCode,
            'oubEiqTemplateName' : templateName
        }).success(function(result) {
            if (result.result) {
                $scope.templateList = result.data;
            } else {
                SweetAlert.swal({
                    title: result.msg,
                    type: "error",
                    confirmButtonColor: "#007AFF",
                    closeOnConfirm: true
                });
            }
        }).error(function(result) {
            alert("系统异常，请稍后重试");
        });
        statistic.active = true;
    }

    /** 增加筛单模板信息 */
    $scope.paymentTypeList = [];
    $scope.addFilterTemplate = function(type) {
        // 为各种下拉框赋值
        $http.get("http://" + $rootScope.domain + "/filter/template/initValue").success(function(result) {
            if (result.result) {
                $scope.orderTypeList = result.data.orderTypeList;
                $scope.invoiceTemplateList = result.data.invoiceTemplateList;
                $scope.packageTypeList = result.data.packageTypeList;
                $scope.erpOrderTypeList = result.data.erpOrderTypeList;
                $scope.paymentTypeList = result.data.paymentTypeList;
                $scope.channelTypeList = result.data.channelTypeList;
                $scope.customerTypeList = result.data.customerTypeList;
                $scope.templateInfo = {};
                $scope.templateInfo.ordersLimit = "2000";
                //品牌信息
                $rootScope.templateInfoInclude = {};
                $rootScope.templateInfoExclude = {};
                //品类信息
                $rootScope.templateInfoItemInclude = {};
                $rootScope.templateInfoItemExclude = {};
                //承运商信息
                $rootScope.templateInfoCarriInclude = {};
                $rootScope.templateInfoCarriExclude = {};
                //省份信息
                $rootScope.templateInfoProvince = {};
                //城市信息
                $rootScope.templateInfoCity = {};
                //模态框数据
                $rootScope.selected = [];
                $rootScope.selectedTags = [];
                $rootScope.selectedEx = [];
                $rootScope.selectedTagsEx = [];
                //承运商模态框数据
                $rootScope.selectedCarri = [];
                $rootScope.selectedTagsCarri = [];
            } else {
                SweetAlert.swal({
                    title: result.msg,
                    type: "error",
                    confirmButtonColor: "#007AFF",
                    closeOnConfirm: true
                });
            }
        }).error(function(result) {
            alert("系统异常，请稍后重试");
        });
        modify.active = true;
        modify.type = 'new';
    }

    /** 多选下拉框操作 begin */
    vm.selection = function() {
        if (modify.type == 'new') {
            var paymentTypeList = _.where($scope.paymentTypeList, {
                checked : true
            });
            var paymentType = "";
            var paymentTypeName = "";
            angular.forEach(paymentTypeList, function(data, index) {
                paymentType += data.codeValue + ",";
                paymentTypeName += data.codeName + ",";
            });
            $scope.templateInfo.paymentType = paymentType.substring(0, paymentType.length - 1);
            $scope.paymentTypeName = paymentTypeName.substring(0, paymentTypeName.length - 1);
        } else {
            var count = 1;
            var paymentTypes = $scope.paymentTypeList;
            if (count == 1) {
                var paymentArray = $scope.templateInfo.paymentType.split(",");
                angular.forEach(paymentTypes, function(data, index) {
                    angular.forEach(paymentArray, function(arrayValue, index) {
                        if (data.codeValue == arrayValue) {
                            data.checked = true;
                        }
                    });
                });
            }
            var paymentType = "";
            var paymentTypeName = "";
            var paymentTypeList = _.where(paymentTypes, {
                checked : true
            });
            angular.forEach(paymentTypeList, function(data, index) {
                paymentType += data.codeValue + ",";
                paymentTypeName += data.codeName + ",";
            });
            $scope.templateInfo.paymentType = paymentType.substring(0, paymentType.length - 1);
            $scope.paymentTypeName = paymentTypeName.substring(0, paymentTypeName.length - 1);
            count = 2;
        }
    };

    channel.selection = function() {
        if (modify.type == 'new') {
            var channelTypeList = _.where($scope.channelTypeList, {
                checked : true
            });
            var channelType = "";
            var channelTypeName = "";
            angular.forEach(channelTypeList, function(data, index) {
                channelType += data.codeValue + ",";
                channelTypeName += data.codeName + ",";
            });
            $scope.templateInfo.channelType = channelType.substring(0, channelType.length - 1);
            $scope.channelTypeName = channelTypeName.substring(0, channelTypeName.length - 1);
        } else {
            var clickCount = 1;
            var channelTypes = $scope.channelTypeList;
            if (clickCount == 1) {
                var channelArray = $scope.templateInfo.channelType.split(",");
                angular.forEach(channelTypes, function(data, index) {
                    angular.forEach(channelArray, function(arrayValue, index) {
                        if (data.codeValue == arrayValue) {
                            data.checked = true;
                        }
                    });
                });
            }
            var channelTypeList = _.where(channelTypes, {
                checked : true
            });
            var channelType = "";
            var channelTypeName = "";
            angular.forEach(channelTypeList, function(data, index) {
                channelType += data.codeValue + ",";
                channelTypeName += data.codeName + ",";
            });
            $scope.templateInfo.channelType = channelType.substring(0, channelType.length - 1);
            $scope.channelTypeName = channelTypeName.substring(0, channelTypeName.length - 1);
            clickCount = 2;
        }
    };

    customer.selection = function() {
        if (modify.type == 'new') {
            var customerTypeList = _.where($scope.customerTypeList, {
                checked : true
            });
            var customerType = "";
            var customerTypeName = "";
            angular.forEach(customerTypeList, function(data, index) {
                customerType += data.codeValue + ",";
                customerTypeName += data.codeName + ",";
            });
            $scope.templateInfo.customerType = customerType.substring(0, customerType.length - 1);
            $scope.customerTypeName = customerTypeName.substring(0, customerTypeName.length - 1);
        } else {
            var customerClick = 1;
            var customerTypes = $scope.customerTypeList;
            if (customerClick == 1) {
                var customerArray = $scope.templateInfo.customerType.split(",");
                angular.forEach(customerTypes, function(data, index) {
                    angular.forEach(customerArray, function(arrayValue, index) {
                        if (data.codeValue == arrayValue) {
                            data.checked = true;
                        }
                    });
                });
            }
            var customerTypeList = _.where(customerTypes, {
                checked : true
            });
            var customerType = "";
            var customerTypeName = "";
            angular.forEach(customerTypeList, function(data, index) {
                customerType += data.codeValue + ",";
                customerTypeName += data.codeName + ",";
            });
            $scope.templateInfo.customerType = customerType.substring(0, customerType.length - 1);
            $scope.customerTypeName = customerTypeName.substring(0, customerTypeName.length - 1);
            customerClick = 2;
        }
    };
    /** 多选下拉框操作 end */

    /** 保存筛单模板信息 */
    // $scope.templateInfo = {};
    $scope.saveFilterTemplate = function(type) {
        if (($scope.templateInfo.oubEiqTemplateCode == null || $scope.templateInfo.oubEiqTemplateCode == '')) {
            alert("模板代码必填");
            return false;
        }
        if (($scope.templateInfo.oubEiqTemplateName == null || $scope.templateInfo.oubEiqTemplateName == '')) {
            alert("模板名称必填");
            return false;
        }
        if (($scope.templateInfo.ordersLimit == null || $scope.templateInfo.ordersLimit == '')) {
            alert("订单数必填");
            return false;
        }
        //品牌信息
        var brandCodeInclude = $rootScope.templateInfoInclude.brandCodeInclude;
        $scope.templateInfo.brandCodeInclude = brandCodeInclude;
        var brandCodeExclude = $rootScope.templateInfoExclude.brandCodeExclude;
        $scope.templateInfo.brandCodeExclude = brandCodeExclude;
        //品类信息
        var itemClassCodeInclude = $rootScope.templateInfoItemInclude.itemClassCodeInclude;
        $scope.templateInfo.itemClassCodeInclude = itemClassCodeInclude;
        var itemClassCodeExclude = $rootScope.templateInfoItemExclude.itemClassCodeExclude;
        $scope.templateInfo.itemClassCodeExclude = itemClassCodeExclude;
        //承运商信息
        var carrierCodeInclude = $rootScope.templateInfoCarriInclude.carrierCodeInclude;
        $scope.templateInfo.carrierCodeInclude = carrierCodeInclude;
        var carrierCodeExclude = $rootScope.templateInfoCarriExclude.carrierCodeExclude;
        $scope.templateInfo.carrierCodeExclude = carrierCodeExclude;
        //省份信息
        var province = $rootScope.templateInfoProvince.province;
        $scope.templateInfo.province = province;
        //城市信息
        var city = $rootScope.templateInfoCity.city;
        $scope.templateInfo.city = city;
        $scope.templateInfo.operationType = type;
        if ($scope.templateInfo.isSingle) {
            $scope.templateInfo.isSingle = '1';
        }
        if ($scope.templateInfo.isSingleSku) {
            $scope.templateInfo.isSingleSku = '1';
        }
        if ($scope.templateInfo.isMultiple) {
            $scope.templateInfo.isMultiple = '1';
        }
        $http.post("http://" + $rootScope.domain + "/save/filter/template", $scope.templateInfo).success(function(result) {
            if (result.result) {
                SweetAlert.swal({
                    title : result.msg,
                    type : "success",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                }, function(isConfirm) {
                    $scope.queryFilterTemplate();
                    statistic.active = true;
                    //$window.location.reload();
                });
            } else {
                SweetAlert.swal({
                    title: result.msg,
                    type: "error",
                    confirmButtonColor: "#007AFF",
                    closeOnConfirm: true
                });
            }
        }).error(function(result) {
            alert("系统异常，请稍后重试");
        });
    };

    var isSelected = false;
    // 选择模板记录行的id
    var oubEiqTemplateId;
    $scope.updateRadioStatus = function($event, id) {
        var radio = $event.target;
        if (radio.checked) {
            isSelected = true;
            oubEiqTemplateId = id;
        }
    };

    /** 删除筛单模板信息 */
    $scope.deleteFilterTemplate = function() {
        if (!isSelected) {
            alert("请选择一行记录！");
            return false;
        }else{
            swal({
                title: "确认是否删除当前记录?",
                type: "warning",
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确认",
                closeOnConfirm: false
                },
                function(){
                    $http.post("http://" + $rootScope.domain + "/delete/filter/template", {
                        'oubEiqTemplateId' : oubEiqTemplateId
                    }).success(function(result) {
                        if (result.result) {
                            SweetAlert.swal({
                                title : result.msg,
                                type : "success",
                                confirmButtonColor : "#007AFF",
                                closeOnConfirm : true
                            }, function(isConfirm) {
                                $scope.queryFilterTemplate();
                            });
                        } else {
                            SweetAlert.swal({
                                title: result.msg,
                                type: "error",
                                confirmButtonColor: "#007AFF",
                                closeOnConfirm: true
                            });
                        }
                    }).error(function(result) {
                        alert("系统异常，请稍后重试");
                    });
                }); 
        }
    };

    /** 查看/编辑模板信息 */
    $scope.modifyTemplateInfo = function(id) {
        //品牌包括
        $rootScope.templateInfoInclude = {};
        //品牌不包括
        $rootScope.templateInfoExclude = {};
        //品类包括和不包括
        $rootScope.templateInfoItemInclude = {};
        $rootScope.templateInfoItemExclude = {};
        //承运商包括和不包括
        $rootScope.templateInfoCarriInclude = {};
        $rootScope.templateInfoCarriExclude = {};
        
        $rootScope.templateInfoProvince = {};
        $rootScope.templateInfoCity = {};
        $http.get("http://" + $rootScope.domain + "/query/unique/template?oubEiqTemplateId=" + id).success(function(result) {
            if (result.result) {
                // $scope.templateInfo.fromDatetime =
                // $filter('date')($scope.templateInfo.fromDatetime,'yyyy-MM-dd
                // HH:mm:ss');
                $scope.templateInfo = result.data.model;
                //品牌包括和不包括
                $rootScope.templateInfoInclude.brandCodeInclude = $scope.templateInfo.brandCodeInclude;
                $rootScope.templateInfoInclude.brandCodeIncludeName = result.data.brandCodeIncludeName;
                $rootScope.templateInfoExclude.brandCodeExclude = $scope.templateInfo.brandCodeExclude;
                $rootScope.templateInfoExclude.brandCodeExcludeName = result.data.brandCodeExcludeName;
                //品类包括和不包括
                $rootScope.templateInfoItemInclude.itemClassCodeInclude = $scope.templateInfo.itemClassCodeInclude;
                $rootScope.templateInfoItemInclude.itemClassCodeIncludeName = result.data.itemClassCodeIncludeName;
                $rootScope.templateInfoItemExclude.itemClassCodeExclude = $scope.templateInfo.itemClassCodeExclude;
                $rootScope.templateInfoItemExclude.itemClassCodeExcludeName = result.data.itemClassCodeExcludeName;
                //承运商包括和不包括
                $rootScope.templateInfoCarriInclude.carrierCodeInclude = $scope.templateInfo.carrierCodeInclude;
                $rootScope.templateInfoCarriInclude.carrierCodeIncludeName = result.data.carrierCodeIncludeName;
                $rootScope.templateInfoCarriExclude.carrierCodeExclude = $scope.templateInfo.carrierCodeExclude;
                $rootScope.templateInfoCarriExclude.carrierCodeExcludeName = result.data.carrierCodeExcludeName;
                //省份
                $rootScope.templateInfoProvince.province = $scope.templateInfo.province;
                $rootScope.templateInfoProvince.provinceName = result.data.provinceName;
                //城市
                $rootScope.templateInfoCity.city = $scope.templateInfo.city;
                $rootScope.templateInfoCity.cityName = result.data.cityName;
                $scope.orderTypeList = result.data.orderTypeList;
                $scope.invoiceTemplateList = result.data.invoiceTemplateList;
                $scope.packageTypeList = result.data.packageTypeList;
                $scope.erpOrderTypeList = result.data.erpOrderTypeList;
                $scope.paymentTypeList = result.data.paymentTypeList;
                $scope.channelTypeList = result.data.channelTypeList;
                $scope.customerTypeList = result.data.customerTypeList;
                modify.active = true;
                modify.type = 'modify';
                isSelected = false;
            }else{
                SweetAlert.swal({
                    title: result.msg,
                    type: "error",
                    confirmButtonColor: "#007AFF",
                    closeOnConfirm: true
                });
            }
        }).error(function(result) {
            alert("系统异常，请稍后重试");
        });
    };

    /** 开启品牌模态框 */
    $scope.openBrandModal = function(type, mold, brandCodes, brandNames) {
        var scope = $rootScope.$new();
        scope.data = {
            header : "选择品牌",
            type : type,
            mold : mold,
            brandCodes : brandCodes,
            brandNames : brandNames
        };
        var modalInstance = $modal.open({
            backdrop : 'static',
            keyboard : true,
            modalFade : true,
            templateUrl : 'assets/views/library/brand-modal.html',
            controller : 'modalBrandInstanceCtrl',
            scope : scope
        });
    };
    
    /** 开启品类模态框 */
    $scope.openItemModal = function(type, mold, itemCodes, itemNames) {
        var scope = $rootScope.$new();
        scope.data = {
            header : "选择品类",
            type : type,
            mold : mold,
            itemCodes : itemCodes,
            itemNames : itemNames
        };
        var modalInstance = $modal.open({
            backdrop : 'static',
            keyboard : true,
            modalFade : true,
            templateUrl : 'assets/views/library/item-modal.html',
            controller : 'modalItemInstanceCtrl',
            scope : scope
        });
    };
    
    /** 开启承运商模态框 */
    $scope.openCarriModal = function(type, mold, carriCodes, carriNames) {
        var scope = $rootScope.$new();
        scope.data = {
            header : "选择承运商",
            type : type,
            mold : mold,
            carriCodes : carriCodes,
            carriNames : carriNames
        };
        var modalInstance = $modal.open({
            backdrop : 'static',
            keyboard : true,
            modalFade : true,
            templateUrl : 'assets/views/library/carrier-modal.html',
            controller : 'modalCarriInstanceCtrl',
            scope : scope
        });
    };
    
    /** 开启省份模态框 */
    $scope.openProvinceModal = function(mold, provinceCodes, provinceNames) {
        var scope = $rootScope.$new();
        scope.data = {
            header : "选择省份",
            mold : mold,
            provinceCodes : provinceCodes,
            provinceNames : provinceNames
        };
        var modalInstance = $modal.open({
            backdrop : 'static',
            keyboard : true,
            modalFade : true,
            templateUrl : 'assets/views/library/province-modal.html',
            controller : 'modalProvinceInstanceCtrl',
            scope : scope
        });
    };
    
    /** 开启城市模态框 */
    $scope.openCityModal = function(mold, cityCodes, cityNames) {
        var scope = $rootScope.$new();
        scope.data = {
            header : "选择城市",
            mold : mold,
            cityCodes : cityCodes,
            cityNames : cityNames
        };
        var modalInstance = $modal.open({
            backdrop : 'static',
            keyboard : true,
            modalFade : true,
            templateUrl : 'assets/views/library/city-modal.html',
            controller : 'modalCityInstanceCtrl',
            scope : scope
        });
    };
}]);

app.controller('modalBrandInstanceCtrl', function($rootScope, $scope, $modalInstance, $http, $window, SweetAlert) {
    $scope.HeaderAndType = $scope.data;
    $scope.brandList = {};

    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.searchCondition = {};

    $scope.queryBrandInfo = function() {
        var queryParams = {
            pageNo : $scope.pageNo,
            pageSize : $scope.pageSize,
            condition : $scope.searchCondition
        };
        $http.post("http://" + $rootScope.domain + "/brand/detail", queryParams).success(function(result) {
            if (result.result) {
                $scope.pageCount = result.data.pageCount;
                $scope.count = result.data.count;
                $scope.brands = result.data.list;
                if ($scope.HeaderAndType.mold == 'modify'){
                    if ($scope.HeaderAndType.type == 'include') {
                        if ($scope.HeaderAndType.brandCodes != undefined && $scope.HeaderAndType.brandCodes.length != 0) {
                            $rootScope.selected = [];
                            $rootScope.selectedTags = [];
                            var brandCodeInc = $scope.HeaderAndType.brandCodes.split(",");
                            $rootScope.selected.push.apply($rootScope.selected, brandCodeInc);
                            var brandNameInc = $scope.HeaderAndType.brandNames.split(",");
                            $rootScope.selectedTags.push.apply($rootScope.selectedTags, brandNameInc);
                            $scope.HeaderAndType.brandCodes = "";
                        }
                    }else{
                        if ($scope.HeaderAndType.brandCodes != undefined && $scope.HeaderAndType.brandCodes.length != 0) {
                            $rootScope.selectedEx = [];
                            $rootScope.selectedTagsEx = [];
                            var brandCodeExc = $scope.HeaderAndType.brandCodes.split(",");
                            $rootScope.selectedEx.push.apply($rootScope.selectedEx, brandCodeExc);
                            var brandNameExc = $scope.HeaderAndType.brandNames.split(",");
                            $rootScope.selectedTagsEx.push.apply($rootScope.selectedTagsEx, brandNameExc);
                            $scope.HeaderAndType.brandCodes = "";
                        }
                    }
                }
            } else {
                SweetAlert.swal({
                    title : result.msg,
                    type : "error",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                });
            }
        }).error(function() {
            alert("查询品牌信息异常");
        });
    };

    $scope.queryBrandInfo();

    $scope.change = function(pageSize) {
        $scope.pageNo = 1;
        $scope.pageSize = pageSize;
        $scope.queryBrandInfo();
    };

    $scope.firstPage = function() {
        if ($scope.pageNo != 1) {
            $scope.pageNo = 1;
            $scope.queryBrandInfo();
        }
    };
    $scope.prevPage = function() {
        if ($scope.pageNo > 1) {
            $scope.pageNo = $scope.pageNo - 1;
            $scope.queryBrandInfo();
        }
    };
    $scope.nextPage = function() {
        if ($scope.pageNo < $scope.pageCount) {
            $scope.pageNo = $scope.pageNo + 1;
            $scope.queryBrandInfo();
        }
    };
    $scope.lastPage = function() {
        if ($scope.pageNo != $scope.pageCount) {
            $scope.pageNo = $scope.pageCount;
            $scope.queryBrandInfo();
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }

    if ($scope.HeaderAndType.type == 'include') {
        $rootScope.templateInfoInclude = {};
        // 选择的品牌ID
        $scope.selected = [];
        // 选择的品牌名称
        $scope.selectedTags = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selected.indexOf(id) == -1) {
                $scope.selected.push(id);
                $scope.selectedTags.push(name);
                if ($rootScope.selected != undefined && $rootScope.selected.length != 0) {
                    $scope.selected.push.apply($scope.selected, $rootScope.selected);
                    $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTags);
                    $rootScope.selected = [];
                    $rootScope.selectedTags = [];
                }
            }
            if (action == 'remove' && ($scope.selected.indexOf(id) != -1 || $rootScope.selected.indexOf(id) != -1)) {
                if ($rootScope.selected != undefined && $rootScope.selected.length != 0) {
                    var idx = $rootScope.selected.indexOf(id);
                    $rootScope.selected.splice(idx, 1);
                    $rootScope.selectedTags.splice(idx, 1);
                    if ($scope.selected.length != 0) {
                        $scope.selected.splice(idx, 1);
                        $scope.selectedTags.splice(idx, 1);
                        $rootScope.selected = [];
                        $rootScope.selectedTags = [];
                    } else {
                        $scope.selected.push.apply($scope.selected, $rootScope.selected);
                        $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTags);
                        $rootScope.selected = [];
                        $rootScope.selectedTags = [];
                    }
                } else {
                    var idx = $scope.selected.indexOf(id);
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selected == undefined || $rootScope.selected.length == 0) {
                return $scope.selected.indexOf(id) >= 0;
            } else {
                return $rootScope.selected.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type, mold) {
            if (type == 'include') {
                if ($scope.selected.length == 0) {
                    var brandSelected = $rootScope.selectedTags.join(",");
                    var brandSelectedId = $rootScope.selected.join(",");
                    $rootScope.templateInfoInclude.brandCodeIncludeName = brandSelected;
                    $rootScope.templateInfoInclude.brandCodeInclude = brandSelectedId;
                    $modalInstance.close();
                }else{
                    var brandSelected = $scope.selectedTags.join(",");
                    var brandSelectedId = $scope.selected.join(",");
                    $rootScope.templateInfoInclude.brandCodeIncludeName = brandSelected;
                    $rootScope.templateInfoInclude.brandCodeInclude = brandSelectedId;
                    $rootScope.selected = $scope.selected;
                    $rootScope.selectedTags = $scope.selectedTags;
                    $modalInstance.close();
                }
            }
        }
    } else {
        $rootScope.templateInfoExclude = {};
        // 选择的品牌ID
        $scope.selectedEx = [];
        // 选择的品牌名称
        $scope.selectedTagsEx = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selectedEx.indexOf(id) == -1) {
                $scope.selectedEx.push(id);
                $scope.selectedTagsEx.push(name);
                if ($rootScope.selectedEx != undefined && $rootScope.selectedEx.length != 0) {
                    $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedEx);
                    $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedTagsEx);
                    $rootScope.selectedEx = [];
                    $rootScope.selectedTagsEx = [];
                }
            }
            if (action == 'remove' && ($scope.selectedEx.indexOf(id) != -1 || $rootScope.selectedEx.indexOf(id) != -1)) {
                if ($rootScope.selectedEx != undefined && $rootScope.selectedEx.length != 0) {
                    var idx = $rootScope.selectedEx.indexOf(id);
                    $rootScope.selectedEx.splice(idx, 1);
                    $rootScope.selectedTagsEx.splice(idx, 1);
                    if ($scope.selectedEx.length != 0) {
                        $scope.selectedEx.splice(idx, 1);
                        $scope.selectedTagsEx.splice(idx, 1);
                        $rootScope.selectedEx = [];
                        $rootScope.selectedTagsEx = [];
                    } else {
                        $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedEx);
                        $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedTagsEx);
                        $rootScope.selectedEx = [];
                        $rootScope.selectedTagsEx = [];
                    }
                } else {
                    var idx = $scope.selectedEx.indexOf(id);
                    $scope.selectedEx.splice(idx, 1);
                    $scope.selectedTagsEx.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selectedEx == undefined || $rootScope.selectedEx.length == 0) {
                return $scope.selectedEx.indexOf(id) >= 0;
            } else {
                return $rootScope.selectedEx.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type) {
            if (type == 'exclude') {
                if ($scope.selectedEx.length == 0) {
                    var brandSelectedEx = $rootScope.selectedTagsEx.join(",");
                    var brandSelectedIdEx = $rootScope.selectedEx.join(",");
                    $rootScope.templateInfoExclude.brandCodeExcludeName = brandSelectedEx;
                    $rootScope.templateInfoExclude.brandCodeExclude = brandSelectedIdEx;
                    $modalInstance.close();
                }else{
                    var brandSelectedEx = $scope.selectedTagsEx.join(",");
                    var brandSelectedExId = $scope.selectedEx.join(",");
                    $rootScope.templateInfoExclude.brandCodeExcludeName = brandSelectedEx;
                    $rootScope.templateInfoExclude.brandCodeExclude = brandSelectedExId;
                    $rootScope.selectedEx = $scope.selectedEx;
                    $rootScope.selectedTagsEx = $scope.selectedTagsEx;
                    $modalInstance.close();
                }
            }
        }
    }
});

app.controller('modalItemInstanceCtrl', function($rootScope, $scope, $modalInstance, $http, $window, SweetAlert) {
    $scope.HeaderAndType = $scope.data;

    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.searchCondition = {};

    $scope.queryItemInfo = function() {
        var queryParams = {
            pageNo : $scope.pageNo,
            pageSize : $scope.pageSize,
            condition : $scope.searchCondition
        };
        $http.post("http://" + $rootScope.domain + "/item/detail", queryParams).success(function(result) {
            if (result.result) {
                $scope.pageCount = result.data.pageCount;
                $scope.count = result.data.count;
                $scope.items = result.data.list;
                if ($scope.HeaderAndType.mold == 'modify'){
                    if ($scope.HeaderAndType.type == 'include') {
                        if ($scope.HeaderAndType.itemCodes != undefined && $scope.HeaderAndType.itemCodes.length != 0) {
                            $rootScope.selectedItem = [];
                            $rootScope.selectedTagsItem = [];
                            var itemCodeInc = $scope.HeaderAndType.itemCodes.split(",");
                            $rootScope.selectedItem.push.apply($rootScope.selectedItem, itemCodeInc);
                            var itemNameInc = $scope.HeaderAndType.itemNames.split(",");
                            $rootScope.selectedTagsItem.push.apply($rootScope.selectedTagsItem, itemNameInc);
                            $scope.HeaderAndType.itemCodes = "";
                        }
                    }else{
                        if ($scope.HeaderAndType.itemCodes != undefined && $scope.HeaderAndType.itemCodes.length != 0) {
                            $rootScope.selectedItemEx = [];
                            $rootScope.selectedTagsItemEx = [];
                            var itemCodeExc = $scope.HeaderAndType.itemCodes.split(",");
                            $rootScope.selectedItemEx.push.apply($rootScope.selectedItemEx, itemCodeExc);
                            var itemNameExc = $scope.HeaderAndType.itemNames.split(",");
                            $rootScope.selectedTagsItemEx.push.apply($rootScope.selectedTagsItemEx, itemNameExc);
                            $scope.HeaderAndType.itemCodes = "";
                        }
                    }
                }
            } else {
                SweetAlert.swal({
                    title : result.msg,
                    type : "error",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                });
            }
        }).error(function(result) {
            alert("查询品类信息异常");
        });
    };

    $scope.queryItemInfo();

    $scope.change = function(pageSize) {
        $scope.pageNo = 1;
        $scope.pageSize = pageSize;
        $scope.queryItemInfo();
    };

    $scope.firstPage = function() {
        if ($scope.pageNo != 1) {
            $scope.pageNo = 1;
            $scope.queryItemInfo();
        }
    };
    $scope.prevPage = function() {
        if ($scope.pageNo > 1) {
            $scope.pageNo = $scope.pageNo - 1;
            $scope.queryItemInfo();
        }
    };
    $scope.nextPage = function() {
        if ($scope.pageNo < $scope.pageCount) {
            $scope.pageNo = $scope.pageNo + 1;
            $scope.queryItemInfo();
        }
    };
    $scope.lastPage = function() {
        if ($scope.pageNo != $scope.pageCount) {
            $scope.pageNo = $scope.pageCount;
            $scope.queryItemInfo();
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }

    if ($scope.HeaderAndType.type == 'include') {
        $rootScope.templateInfoItemInclude = {};
        // 选择的品类ID
        $scope.selected = [];
        // 选择的品类名称
        $scope.selectedTags = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selected.indexOf(id) == -1) {
                $scope.selected.push(id);
                $scope.selectedTags.push(name);
                if ($rootScope.selectedItem != undefined && $rootScope.selectedItem.length != 0) {
                    $scope.selected.push.apply($scope.selected, $rootScope.selectedItem);
                    $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsItem);
                    $rootScope.selectedItem = [];
                    $rootScope.selectedTagsItem = [];
                }
            }
            if (action == 'remove' && ($scope.selected.indexOf(id) != -1 || $rootScope.selectedItem.indexOf(id) != -1)) {
                if ($rootScope.selectedItem != undefined && $rootScope.selectedItem.length != 0) {
                    var idx = $rootScope.selectedItem.indexOf(id);
                    $rootScope.selectedItem.splice(idx, 1);
                    $rootScope.selectedTagsItem.splice(idx, 1);
                    if ($scope.selected.length != 0) {
                        $scope.selected.splice(idx, 1);
                        $scope.selectedTags.splice(idx, 1);
                        $rootScope.selectedItem = [];
                        $rootScope.selectedTagsItem = [];
                    } else {
                        $scope.selected.push.apply($scope.selected, $rootScope.selectedItem);
                        $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsItem);
                        $rootScope.selectedItem = [];
                        $rootScope.selectedTagsItem = [];
                    }
                } else {
                    var idx = $scope.selected.indexOf(id);
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selectedItem == undefined || $rootScope.selectedItem.length == 0) {
                return $scope.selected.indexOf(id) >= 0;
            } else {
                return $rootScope.selectedItem.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type, mold) {
            if (type == 'include') {
                if ($scope.selected.length == 0) {
                    var itemSelected = $rootScope.selectedTagsItem.join(",");
                    var itemSelectedId = $rootScope.selectedItem.join(",");
                    $rootScope.templateInfoItemInclude.itemClassCodeIncludeName = itemSelected;
                    $rootScope.templateInfoItemInclude.itemClassCodeInclude = itemSelectedId;
                    $modalInstance.close();
                }else{
                    var itemSelected = $scope.selectedTags.join(",");
                    var itemSelectedId = $scope.selected.join(",");
                    $rootScope.templateInfoItemInclude.itemClassCodeIncludeName = itemSelected;
                    $rootScope.templateInfoItemInclude.itemClassCodeInclude = itemSelectedId;
                    $rootScope.selectedItem = $scope.selected;
                    $rootScope.selectedTagsItem = $scope.selectedTags;
                    $modalInstance.close();
                }
            }
        }
    } else {
        $rootScope.templateInfoItemExclude = {};
        // 选择的品类ID
        $scope.selectedEx = [];
        // 选择的品类名称
        $scope.selectedTagsEx = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selectedEx.indexOf(id) == -1) {
                $scope.selectedEx.push(id);
                $scope.selectedTagsEx.push(name);
                if ($rootScope.selectedItemEx != undefined && $rootScope.selectedItemEx.length != 0) {
                    $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedItemEx);
                    $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedTagsItemEx);
                    $rootScope.selectedItemEx = [];
                    $rootScope.selectedTagsItemEx = [];
                }
            }
            if (action == 'remove' && ($scope.selectedEx.indexOf(id) != -1 || $rootScope.selectedItemEx.indexOf(id) != -1)) {
                if ($rootScope.selectedItemEx != undefined && $rootScope.selectedItemEx.length != 0) {
                    var idx = $rootScope.selectedItemEx.indexOf(id);
                    $rootScope.selectedItemEx.splice(idx, 1);
                    $rootScope.selectedTagsItemEx.splice(idx, 1);
                    if ($scope.selectedEx.length != 0) {
                        $scope.selectedEx.splice(idx, 1);
                        $scope.selectedTagsEx.splice(idx, 1);
                        $rootScope.selectedItemEx = [];
                        $rootScope.selectedTagsItemEx = [];
                    } else {
                        $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedItemEx);
                        $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedTagsItemEx);
                        $rootScope.selectedItemEx = [];
                        $rootScope.selectedTagsItemEx = [];
                    }
                } else {
                    var idx = $scope.selectedEx.indexOf(id);
                    $scope.selectedEx.splice(idx, 1);
                    $scope.selectedTagsEx.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selectedItemEx == undefined || $rootScope.selectedItemEx.length == 0) {
                return $scope.selectedEx.indexOf(id) >= 0;
            } else {
                return $rootScope.selectedItemEx.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type) {
            if (type == 'exclude') {
                if ($scope.selectedEx.length == 0) {
                    var itemSelectedEx = $rootScope.selectedTagsItemEx.join(",");
                    var itemSelectedIdEx = $rootScope.selectedItemEx.join(",");
                    $rootScope.templateInfoItemExclude.itemClassCodeExcludeName = itemSelectedEx;
                    $rootScope.templateInfoItemExclude.itemClassCodeExclude = itemSelectedIdEx;
                    $modalInstance.close();
                }else{
                    var itemSelectedEx = $scope.selectedTagsEx.join(",");
                    var itemSelectedExId = $scope.selectedEx.join(",");
                    $rootScope.templateInfoItemExclude.itemClassCodeExcludeName = itemSelectedEx;
                    $rootScope.templateInfoItemExclude.itemClassCodeExclude = itemSelectedExId;
                    $rootScope.selectedItemEx = $scope.selectedEx;
                    $rootScope.selectedTagsItemEx = $scope.selectedTagsEx;
                    $modalInstance.close();
                }
            }
        }
    }
});

app.controller('modalCarriInstanceCtrl', function($rootScope, $scope, $modalInstance, $http, $window, SweetAlert) {
    $scope.HeaderAndType = $scope.data;

    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.searchCondition = {};

    $scope.queryCarrierInfo = function() {
        var queryParams = {
            pageNo : $scope.pageNo,
            pageSize : $scope.pageSize,
            condition : $scope.searchCondition
        };
        $http.post("http://" + $rootScope.domain + "/carrier/detail", queryParams).success(function(result) {
            if (result.result) {
                $scope.pageCount = result.data.pageCount;
                $scope.count = result.data.count;
                $scope.carris = result.data.list;
                if ($scope.HeaderAndType.mold == 'modify'){
                    if ($scope.HeaderAndType.type == 'include') {
                        if ($scope.HeaderAndType.carriCodes != undefined && $scope.HeaderAndType.carriCodes.length != 0) {
                            $rootScope.selectedCarri = [];
                            $rootScope.selectedTagsCarri = [];
                            var carriCodeInc = $scope.HeaderAndType.carriCodes.split(",");
                            $rootScope.selectedCarri.push.apply($rootScope.selectedCarri, carriCodeInc);
                            var carriNameInc = $scope.HeaderAndType.carriNames.split(",");
                            $rootScope.selectedTagsCarri.push.apply($rootScope.selectedTagsCarri, carriNameInc);
                            $scope.HeaderAndType.carriCodes = "";
                        }
                    }else{
                        if ($scope.HeaderAndType.carriCodes != undefined && $scope.HeaderAndType.carriCodes.length != 0) {
                            $rootScope.selectedCarriEx = [];
                            $rootScope.selectedTagsCarriEx = [];
                            var carriCodeExc = $scope.HeaderAndType.carriCodes.split(",");
                            $rootScope.selectedCarriEx.push.apply($rootScope.selectedCarriEx, carriCodeExc);
                            var carriNameExc = $scope.HeaderAndType.carriNames.split(",");
                            $rootScope.selectedTagsCarriEx.push.apply($rootScope.selectedTagsCarriEx, carriNameExc);
                            $scope.HeaderAndType.carriCodes = "";
                        }
                    }
                }
            } else {
                SweetAlert.swal({
                    title : result.msg,
                    type : "error",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                });
            }
        }).error(function(result) {
            alert("查询品类信息异常");
        });
    };

    $scope.queryCarrierInfo();

    $scope.change = function(pageSize) {
        $scope.pageNo = 1;
        $scope.pageSize = pageSize;
        $scope.queryCarrierInfo();
    };

    $scope.firstPage = function() {
        if ($scope.pageNo != 1) {
            $scope.pageNo = 1;
            $scope.queryCarrierInfo();
        }
    };
    $scope.prevPage = function() {
        if ($scope.pageNo > 1) {
            $scope.pageNo = $scope.pageNo - 1;
            $scope.queryCarrierInfo();
        }
    };
    $scope.nextPage = function() {
        if ($scope.pageNo < $scope.pageCount) {
            $scope.pageNo = $scope.pageNo + 1;
            $scope.queryCarrierInfo();
        }
    };
    $scope.lastPage = function() {
        if ($scope.pageNo != $scope.pageCount) {
            $scope.pageNo = $scope.pageCount;
            $scope.queryCarrierInfo();
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }

    if ($scope.HeaderAndType.type == 'include') {
        $rootScope.templateInfoCarriInclude = {};
        // 选择的品类ID
        $scope.selected = [];
        // 选择的品类名称
        $scope.selectedTags = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selected.indexOf(id) == -1) {
                $scope.selected.push(id);
                $scope.selectedTags.push(name);
                if ($rootScope.selectedCarri != undefined && $rootScope.selectedCarri.length != 0) {
                    $scope.selected.push.apply($scope.selected, $rootScope.selectedCarri);
                    $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsCarri);
                    $rootScope.selectedCarri = [];
                    $rootScope.selectedTagsCarri = [];
                }
            }
            if (action == 'remove' && ($scope.selected.indexOf(id) != -1 || $rootScope.selectedCarri.indexOf(id) != -1)) {
                if ($rootScope.selectedCarri != undefined && $rootScope.selectedCarri.length != 0) {
                    var idx = $rootScope.selectedCarri.indexOf(id);
                    $rootScope.selectedCarri.splice(idx, 1);
                    $rootScope.selectedTagsCarri.splice(idx, 1);
                    if ($scope.selected.length != 0) {
                        $scope.selected.splice(idx, 1);
                        $scope.selectedTags.splice(idx, 1);
                        $rootScope.selectedCarri = [];
                        $rootScope.selectedTagsCarri = [];
                    } else {
                        $scope.selected.push.apply($scope.selected, $rootScope.selectedCarri);
                        $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsCarri);
                        $rootScope.selectedCarri = [];
                        $rootScope.selectedTagsCarri = [];
                    }
                } else {
                    var idx = $scope.selected.indexOf(id);
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selectedCarri == undefined || $rootScope.selectedCarri.length == 0) {
                return $scope.selected.indexOf(id) >= 0;
            } else {
                return $rootScope.selectedCarri.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type, mold) {
            if (type == 'include') {
                if ($scope.selected.length == 0) {
                    var carriSelected = $rootScope.selectedTagsCarri.join(",");
                    var carriSelectedId = $rootScope.selectedCarri.join(",");
                    $rootScope.templateInfoCarriInclude.carrierCodeIncludeName = carriSelected;
                    $rootScope.templateInfoCarriInclude.carrierCodeInclude = carriSelectedId;
                    $modalInstance.close();
                }else{
                    var carriSelected = $scope.selectedTags.join(",");
                    var carriSelectedId = $scope.selected.join(",");
                    $rootScope.templateInfoCarriInclude.carrierCodeIncludeName = carriSelected;
                    $rootScope.templateInfoCarriInclude.carrierCodeInclude = carriSelectedId;
                    $rootScope.selectedCarri = $scope.selected;
                    $rootScope.selectedTagsCarri = $scope.selectedTags;
                    $modalInstance.close();
                }
            }
        }
    } else {
        $rootScope.templateInfoCarriExclude = {};
        // 选择的品牌ID
        $scope.selectedEx = [];
        // 选择的品牌名称
        $scope.selectedTagsEx = [];

        $scope.updateSelection = function($event, id) {
            var checkbox = $event.target;
            var action = (checkbox.checked ? 'add' : 'remove');
            updateSelected(action, id, checkbox.name);
        }

        var updateSelected = function(action, id, name) {
            if (action == 'add' && $scope.selectedEx.indexOf(id) == -1) {
                $scope.selectedEx.push(id);
                $scope.selectedTagsEx.push(name);
                if ($rootScope.selectedCarriEx != undefined && $rootScope.selectedCarriEx.length != 0) {
                    $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedCarriEx);
                    $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedCarriEx);
                    $rootScope.selectedCarriEx = [];
                    $rootScope.selectedTagsCarriEx = [];
                }
            }
            if (action == 'remove' && ($scope.selectedEx.indexOf(id) != -1 || $rootScope.selectedCarriEx.indexOf(id) != -1)) {
                if ($rootScope.selectedCarriEx != undefined && $rootScope.selectedCarriEx.length != 0) {
                    var idx = $rootScope.selectedCarriEx.indexOf(id);
                    $rootScope.selectedCarriEx.splice(idx, 1);
                    $rootScope.selectedTagsCarriEx.splice(idx, 1);
                    if ($scope.selectedEx.length != 0) {
                        $scope.selectedEx.splice(idx, 1);
                        $scope.selectedTagsEx.splice(idx, 1);
                        $rootScope.selectedCarriEx = [];
                        $rootScope.selectedTagsCarriEx = [];
                    } else {
                        $scope.selectedEx.push.apply($scope.selectedEx, $rootScope.selectedCarriEx);
                        $scope.selectedTagsEx.push.apply($scope.selectedTagsEx, $rootScope.selectedTagsCarriEx);
                        $rootScope.selectedCarriEx = [];
                        $rootScope.selectedTagsCarriEx = [];
                    }
                } else {
                    var idx = $scope.selectedEx.indexOf(id);
                    $scope.selectedEx.splice(idx, 1);
                    $scope.selectedTagsEx.splice(idx, 1);
                }
            }
        }

        $scope.isSelected = function(id) {
            if ($rootScope.selectedCarriEx == undefined || $rootScope.selectedCarriEx.length == 0) {
                return $scope.selectedEx.indexOf(id) >= 0;
            } else {
                return $rootScope.selectedCarriEx.indexOf(id) >= 0;
            }
        };

        $scope.confirm = function(type) {
            if (type == 'exclude') {
                if ($scope.selectedEx.length == 0) {
                    var carriSelectedEx = $rootScope.selectedTagsCarriEx.join(",");
                    var carriSelectedIdEx = $rootScope.selectedCarriEx.join(",");
                    $rootScope.templateInfoCarriExclude.carrierCodeExcludeName = carriSelectedEx;
                    $rootScope.templateInfoCarriExclude.carrierCodeExclude = carriSelectedIdEx;
                    $modalInstance.close();
                }else{
                    var carriSelectedEx = $scope.selectedTagsEx.join(",");
                    var carriSelectedExId = $scope.selectedEx.join(",");
                    $rootScope.templateInfoCarriExclude.carrierCodeExcludeName = carriSelectedEx;
                    $rootScope.templateInfoCarriExclude.carrierCodeExclude = carriSelectedExId;
                    $rootScope.selectedCarriEx = $scope.selectedEx;
                    $rootScope.selectedTagsCarriEx = $scope.selectedTagsEx;
                    $modalInstance.close();
                }
            }
        }
    }
});

app.controller('modalProvinceInstanceCtrl', function($rootScope, $scope, $modalInstance, $http, $window, SweetAlert) {
    $scope.HeaderAndType = $scope.data;

    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.searchCondition = {};

    $scope.queryProvinceInfo = function() {
        var queryParams = {
            pageNo : $scope.pageNo,
            pageSize : $scope.pageSize,
            condition : $scope.searchCondition
        };
        $http.post("http://" + $rootScope.domain + "/province/detail", queryParams).success(function(result) {
            if (result.result) {
                $scope.pageCount = result.data.pageCount;
                $scope.count = result.data.count;
                $scope.provinces = result.data.list;
                if ($scope.HeaderAndType.mold == 'modify'){
                    $rootScope.selectedProvince = [];
                    $rootScope.selectedTagsProvince = [];
                    if ($scope.HeaderAndType.provinceCodes != undefined && $scope.HeaderAndType.provinceCodes != '') {
                        var provinceCode = $scope.HeaderAndType.provinceCodes.split(",");
                        $rootScope.selectedProvince.push.apply($rootScope.selectedProvince, provinceCode);
                        var provinceName = $scope.HeaderAndType.provinceNames.split(",");
                        $rootScope.selectedTagsProvince.push.apply($rootScope.selectedTagsProvince, provinceName);
                    }
                }
          } else {
            SweetAlert.swal({
                title : result.msg,
                type : "error",
                confirmButtonColor : "#007AFF",
                closeOnConfirm : true
            });
            }
        }).error(function(result) {
            alert("查询省份信息异常");
        });
    };

    $scope.queryProvinceInfo();

    $scope.change = function(pageSize) {
        $scope.pageNo = 1;
        $scope.pageSize = pageSize;
        $scope.queryProvinceInfo();
    };

    $scope.firstPage = function() {
        if ($scope.pageNo != 1) {
            $scope.pageNo = 1;
            $scope.queryProvinceInfo();
        }
    };
    $scope.prevPage = function() {
        if ($scope.pageNo > 1) {
            $scope.pageNo = $scope.pageNo - 1;
            $scope.queryProvinceInfo();
        }
    };
    $scope.nextPage = function() {
        if ($scope.pageNo < $scope.pageCount) {
            $scope.pageNo = $scope.pageNo + 1;
            $scope.queryProvinceInfo();
        }
    };
    $scope.lastPage = function() {
        if ($scope.pageNo != $scope.pageCount) {
            $scope.pageNo = $scope.pageCount;
            $scope.queryProvinceInfo();
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }

    $rootScope.templateInfoProvince = {};
    // 选择的品类ID
    $scope.selected = [];
    // 选择的品类名称
    $scope.selectedTags = [];

    $scope.updateSelection = function($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        updateSelected(action, id, checkbox.name);
    }

    var updateSelected = function(action, id, name) {
        if (action == 'add' && $scope.selected.indexOf(id) == -1) {
            $scope.selected.push(id);
            $scope.selectedTags.push(name);
            if ($rootScope.selectedProvince != undefined && $rootScope.selectedProvince.length != 0) {
                $scope.selected.push.apply($scope.selected, $rootScope.selectedProvince);
                $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsProvince);
                $rootScope.selectedProvince = [];
                $rootScope.selectedTagsProvince = [];
            }
        }
        if (action == 'remove' && ($scope.selected.indexOf(id) != -1 || $rootScope.selectedProvince.indexOf(id) != -1)) {
            if ($rootScope.selectedProvince != undefined && $rootScope.selectedProvince.length != 0) {
                var idx = $rootScope.selectedProvince.indexOf(id);
                $rootScope.selectedProvince.splice(idx, 1);
                $rootScope.selectedTagsProvince.splice(idx, 1);
                if ($scope.selected.length != 0) {
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                    $rootScope.selectedProvince = [];
                    $rootScope.selectedTagsProvince = [];
                } else {
                    $scope.selected.push.apply($scope.selected, $rootScope.selectedProvince);
                    $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsProvince);
                    $rootScope.selectedProvince = [];
                    $rootScope.selectedTagsProvince = [];
                }
            } else {
                var idx = $scope.selected.indexOf(id);
                $scope.selected.splice(idx, 1);
                $scope.selectedTags.splice(idx, 1);
            }
        }
    }

    $scope.isSelected = function(id) {
        if ($rootScope.selectedProvince == undefined || $rootScope.selectedProvince.length == 0) {
            return $scope.selected.indexOf(id) >= 0;
        } else {
            return $rootScope.selectedProvince.indexOf(id) >= 0;
        }
    };

    $scope.confirm = function() {
        if ($scope.selected.length == 0) {
            var provinceSelected = $rootScope.selectedTagsProvince.join(",");
            var provinceSelectedId = $rootScope.selectedProvince.join(",");
            $rootScope.templateInfoProvince.provinceName = provinceSelected;
            $rootScope.templateInfoProvince.province = provinceSelectedId;
            $modalInstance.close();
        }else{
            var provinceSelected = $scope.selectedTags.join(",");
            var provinceSelectedId = $scope.selected.join(",");
            $rootScope.templateInfoProvince.provinceName = provinceSelected;
            $rootScope.templateInfoProvince.province = provinceSelectedId;
            $rootScope.selectedProvince = $scope.selected;
            $rootScope.selectedTagsProvince = $scope.selectedTags;
            $modalInstance.close();
        }
    }
});

app.controller('modalCityInstanceCtrl', function($rootScope, $scope, $modalInstance, $http, $window, SweetAlert) {
    $scope.HeaderAndType = $scope.data;

    $scope.pageNo = 1;
    $scope.pageSize = 10;
    $scope.searchCondition = {};

    $scope.queryCityInfo = function() {
        var queryParams = {
            pageNo : $scope.pageNo,
            pageSize : $scope.pageSize,
            condition : $scope.searchCondition
        };
        $http.post("http://" + $rootScope.domain + "/city/detail", queryParams).success(function(result) {
            if (result.result) {
                $scope.pageCount = result.data.pageCount;
                $scope.count = result.data.count;
                $scope.citys = result.data.list;
                if ($scope.HeaderAndType.mold == 'modify'){
                    $rootScope.selectedCity = [];
                    $rootScope.selectedTagsCity = [];
                    if ($scope.HeaderAndType.cityCodes != undefined && $scope.HeaderAndType.cityCodes != '') {
                        var cityCode = $scope.HeaderAndType.cityCodes.split(",");
                        $rootScope.selectedCity.push.apply($rootScope.selectedCity, cityCode);
                        var cityName = $scope.HeaderAndType.cityNames.split(",");
                        $rootScope.selectedTagsCity.push.apply($rootScope.selectedTagsCity, cityName);
                    }
                }
          } else {
            SweetAlert.swal({
                title : result.msg,
                type : "error",
                confirmButtonColor : "#007AFF",
                closeOnConfirm : true
            });
            }
        }).error(function(result) {
            alert("查询省份信息异常");
        });
    };

    $scope.queryCityInfo();

    $scope.change = function(pageSize) {
        $scope.pageNo = 1;
        $scope.pageSize = pageSize;
        $scope.queryCityInfo();
    };

    $scope.firstPage = function() {
        if ($scope.pageNo != 1) {
            $scope.pageNo = 1;
            $scope.queryCityInfo();
        }
    };
    $scope.prevPage = function() {
        if ($scope.pageNo > 1) {
            $scope.pageNo = $scope.pageNo - 1;
            $scope.queryCityInfo();
        }
    };
    $scope.nextPage = function() {
        if ($scope.pageNo < $scope.pageCount) {
            $scope.pageNo = $scope.pageNo + 1;
            $scope.queryCityInfo();
        }
    };
    $scope.lastPage = function() {
        if ($scope.pageNo != $scope.pageCount) {
            $scope.pageNo = $scope.pageCount;
            $scope.queryCityInfo();
        }
    };

    $scope.close = function() {
        $modalInstance.dismiss('cancel');
    }

    $rootScope.templateInfoCity = {};
    // 选择的品类ID
    $scope.selected = [];
    // 选择的品类名称
    $scope.selectedTags = [];

    $scope.updateSelection = function($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        updateSelected(action, id, checkbox.name);
    }

    var updateSelected = function(action, id, name) {
        if (action == 'add' && $scope.selected.indexOf(id) == -1) {
            $scope.selected.push(id);
            $scope.selectedTags.push(name);
            if ($rootScope.selectedCity != undefined && $rootScope.selectedCity.length != 0) {
                $scope.selected.push.apply($scope.selected, $rootScope.selectedCity);
                $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsCity);
                $rootScope.selectedCity = [];
                $rootScope.selectedTagsCity = [];
            }
        }
        if (action == 'remove' && ($scope.selected.indexOf(id) != -1 || $rootScope.selectedCity.indexOf(id) != -1)) {
            if ($rootScope.selectedCity != undefined && $rootScope.selectedCity.length != 0) {
                var idx = $rootScope.selectedCity.indexOf(id);
                $rootScope.selectedCity.splice(idx, 1);
                $rootScope.selectedTagsCity.splice(idx, 1);
                if ($scope.selected.length != 0) {
                    $scope.selected.splice(idx, 1);
                    $scope.selectedTags.splice(idx, 1);
                    $rootScope.selectedCity = [];
                    $rootScope.selectedTagsCity = [];
                } else {
                    $scope.selected.push.apply($scope.selected, $rootScope.selectedCity);
                    $scope.selectedTags.push.apply($scope.selectedTags, $rootScope.selectedTagsCity);
                    $rootScope.selectedCity = [];
                    $rootScope.selectedTagsCity = [];
                }
            } else {
                var idx = $scope.selected.indexOf(id);
                $scope.selected.splice(idx, 1);
                $scope.selectedTags.splice(idx, 1);
            }
        }
    }

    $scope.isSelected = function(id) {
        if ($rootScope.selectedCity == undefined || $rootScope.selectedCity.length == 0) {
            return $scope.selected.indexOf(id) >= 0;
        } else {
            return $rootScope.selectedCity.indexOf(id) >= 0;
        }
    };

    $scope.confirm = function() {
        if ($scope.selected.length == 0) {
            var citySelected = $rootScope.selectedTagsCity.join(",");
            var citySelectedId = $rootScope.selectedCity.join(",");
            $rootScope.templateInfoCity.cityName = citySelected;
            $rootScope.templateInfoCity.city = citySelectedId;
            $modalInstance.close();
        }else{
            var citySelected = $scope.selectedTags.join(",");
            var citySelectedId = $scope.selected.join(",");
            $rootScope.templateInfoCity.cityName = citySelected;
            $rootScope.templateInfoCity.city = citySelectedId;
            $rootScope.selectedCity = $scope.selected;
            $rootScope.selectedTagsCity = $scope.selectedTags;
            $modalInstance.close();
        }
    }
});