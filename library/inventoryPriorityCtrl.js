'use strict';

app.controller('inventoryPriorityCtrl', [ "$rootScope", "$scope", "$http", "$window", "$modal", "$filter", "$q", "SweetAlert", function($rootScope, $scope, $http, $window, $modal, $filter, $q, SweetAlert) {
    //保存库存匹配规则数据
    $scope.ruleInfo = {};
    var vm = $scope.vm = {};
    var channel = $scope.channel = {};
    var customer = $scope.customer = {};
    var condition = $scope.condition = {};
    var statistic = $scope.statistic = {};
    var modify = $scope.modify = {};
    //表格
    $scope.rowsList = [];
    /**选择的行数据，为保存分配规则使用，
       因为如果是选择的行， 直接点击确定，
       应该不增数据 */
    var selectedIndex = '';

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
    
    //初始化页面，查询波次处理类型
    $scope.queryProcessType = function(){
      $http.get("http://" + $rootScope.domain + "/query/process/type")
          .success(function(result){
              if (result.result) {
                  $scope.launchProcessTypeList = result.data;
              }else{
                  SweetAlert.swal({
                      title: result.msg,
                      type: "error",
                      confirmButtonColor: "#007AFF",
                      closeOnConfirm: true
                  });
              }
          }).error(function(result){
              alert("系统异常,请稍后重试");
          })
    };
    
    //页面进来之后，就对波次处理类型进行初始化
    $scope.queryProcessType();
    
    //添加行
    $scope.trueOrFalse = true;
    $scope.trueOrFalse_left = true;
    $scope.trueOrFalse_right = true;
    $scope.trueOrFalse_value = true;
    $scope.addTableColumn = function(){
        $scope.ruleInfo = {};
        $scope.ruleInfo.logicalOperator = "AND ";
        $scope.trueOrFalse = false;
        $scope.trueOrFalse_left = false;
        $scope.trueOrFalse_right = false;
        $scope.trueOrFalse_value = false;
        selectedIndex = '';
        //$scope.rowsList.push({allocationStrategy:""});
    };
    
    var isSelected = false;
    // 选择模板记录行的id
    var oubAllocationRuleId;
    $scope.updateRadioStatus = function($event, id) {
        var radio = $event.target;
        if (radio.checked) {
            isSelected = true;
            oubAllocationRuleId = id;
        }
    };
    
    var isTableSelected = false;
    $scope.afterSelectRow = function($event, $index) {
        selectedIndex = $index;
        var radio = $event.target;
        if (radio.checked) {
            isTableSelected = true;
        }

        $scope.ruleInfo.logicalOperator = "";
        $scope.ruleInfo.leftBracket = "";
        $scope.ruleInfo.rightBracket = "";
        
        var allocationRuleId = $index;
        var obj = $scope.rowsList[allocationRuleId];
        var condition = obj.trim();
        var condtionType = " is not null ";
        if(obj.indexOf(" is not null") != -1){
            var idx = condition.indexOf(" is not null");
            condition = condition.replace("is not null",'@null@null');
        }
        
        if(obj.indexOf(" is null") != -1){
            //var idx = condition.indexOf(" is null");
            condition = condition.replace("is null",'@null');
        }
        if (obj.indexOf(" not like") != -1) {
            condition = condition.replace("not like","@exclike");
        }
        if (obj.indexOf(" not in") != -1) {
            condition = condition.replace("not in","@exclude");
        }
        condition = condition.replace(/\s/ig,'@');
        condition = condition.replace('@@','@');
        condition = condition.replace('@@','@');
        condition = condition.replace('@@','@');
        condition = condition.replace('@@','@');
        condition = condition.replace('[','');
        condition = condition.replace(']','');
        
        
        if(condition.indexOf("\'")!=-1){
            //处理值中的空格
            var newCondition = condition.substring(condition.indexOf("\'")+1,condition.lastIndexOf("\'"))
            //如果值中有@符号，则替换为空格
            if(newCondition.indexOf("@")!=-1){    
               newCondition = newCondition.replace('@',' ');
            }
            var prefix = condition.substring(0,condition.indexOf("\'"))
            var suffix = newCondition + condition.substring((condition.lastIndexOf("\'")+1));;
            condition = prefix + suffix;
        }
        
        
        var conditions = condition.split("@");
        var lengths = conditions.length;
        if(lengths==3){
            $scope.ruleInfo.logicalOperator = conditions[0] + " ";
            $scope.ruleInfo.field = conditions[1];
            if(conditions[1]=="null"){
                $scope.ruleInfo.operator = " is not null ";
                $scope.ruleInfo.value = "";
            }else if(conditions[2]=="null"){
                $scope.ruleInfo.operator = " is null ";
                $scope.ruleInfo.value = "";
                $scope.ruleInfo.parameter = "";
            }
        }else if(lengths==4){
            if(conditions[0]=="("){
                $scope.ruleInfo.leftBracket = " " +conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                if(conditions[2]=="null"){
                    $scope.ruleInfo.operator = condtionType;
                    $scope.ruleInfo.value = "";
                    $scope.ruleInfo.parameter = "";
                }else{
                    $scope.ruleInfo.operator = " " +conditions[2]+ " ";
                    $scope.ruleInfo.value = conditions[3];
                    $scope.ruleInfo.parameter = conditions[3];
                }
            }else if(conditions[3]==")"){
                $scope.ruleInfo.rightBracket = " " +conditions[3]+ " ";
                $scope.ruleInfo.field = conditions[0];
                if(conditions[2]=="null"){
                    $scope.ruleInfo.operator = condtionType;
                    $scope.ruleInfo.value = "";
                    $scope.ruleInfo.parameter = "";
                }else{
                    $scope.ruleInfo.operator = " " +conditions[1]+ " ";
                    $scope.ruleInfo.value = conditions[2];
                    $scope.ruleInfo.parameter = conditions[2];
                }
            }else if(conditions[2]=="in"){
                var sel13 = conditions[3];
                sel13 = sel13.replace(/\'/g,'');
                sel13 = sel13.substring(1,sel13.length-1);  
                
                $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                if(conditions[2]=="null"){
                    $scope.ruleInfo.operator = condtionType;
                    $scope.ruleInfo.value = "";
                    $scope.ruleInfo.parameter = "";
                }else{
                    $scope.ruleInfo.operator = " " +conditions[2]+ " ";
                    $scope.ruleInfo.value = sel13;
                    $scope.ruleInfo.parameter = sel13;
                }
            }else if(conditions[2]=="exclude"){
                var sel13 = conditions[3];
                sel13 = sel13.replace(/\'/g,'');
                sel13 = sel13.substring(1,sel13.length-1);  
                
                $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                $scope.ruleInfo.operator = " not in ";
                $scope.ruleInfo.value = sel13;
                $scope.ruleInfo.parameter = sel13;
            }else if(conditions[2] == "exclike"){
                $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                $scope.ruleInfo.operator = " not like ";
                $scope.ruleInfo.value = conditions[3];
                $scope.ruleInfo.parameter = conditions[3];
            }else{
                $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                if(conditions[2]=="null"){
                    $scope.ruleInfo.operator = condtionType;
                    $scope.ruleInfo.value = "";
                    $scope.ruleInfo.parameter = "";
                }else{
                    $scope.ruleInfo.operator = " " +conditions[2]+ " ";
                    $scope.ruleInfo.value = conditions[3];
                    $scope.ruleInfo.parameter = conditions[3];
                }
            }
        }else if(lengths==5){
            if(conditions[0]=="("){
                $scope.ruleInfo.leftBracket = " " +conditions[0]+ " ";
                $scope.ruleInfo.field = conditions[1];
                if(conditions[2]=="null"){              
                    $scope.ruleInfo.operator = condtionType;
                    $scope.ruleInfo.value = "";
                    $scope.ruleInfo.parameter = "";
                }else{
                    $scope.ruleInfo.operator = " " +conditions[2]+ " ";
                    $scope.ruleInfo.value = conditions[3];
                    $scope.ruleInfo.parameter = conditions[3];
                }
                $scope.ruleInfo.rightBracket = " " +conditions[4]+ " ";
            }else{
                $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
                if(conditions[1]=="("){
                    $scope.ruleInfo.leftBracket = " " +conditions[1]+ " ";
                    $scope.ruleInfo.field = conditions[2];
                    if(conditions[3]=="null"){
                        $scope.ruleInfo.operator = condtionType;
                        $scope.ruleInfo.value = "";
                        $scope.ruleInfo.parameter = "";
                    }else{
                        $scope.ruleInfo.operator = " " +conditions[3]+ " ";
                        $scope.ruleInfo.value = conditions[4];
                        $scope.ruleInfo.parameter = conditions[4];
                    }
                }else{
                    $scope.ruleInfo.field = conditions[1];
                    if(conditions[2]=="null"){
                        $scope.ruleInfo.operator = condtionType;
                        $scope.ruleInfo.value = "";
                        $scope.ruleInfo.parameter = "";
                    }else{
                        $scope.ruleInfo.operator = " " + conditions[2] + " ";
                        $scope.ruleInfo.value = conditions[3];
                        $scope.ruleInfo.parameter = conditions[3];
                    }
                    $scope.ruleInfo.rightBracket = " " +conditions[4]+ " ";
                }
            }
        }else if(lengths==6){
            $scope.ruleInfo.logicalOperator = conditions[0]+ " ";
            $scope.ruleInfo.leftBracket = " " +conditions[1]+ " ";
            $scope.ruleInfo.field = conditions[2];
            $scope.ruleInfo.rightBracket = " " +conditions[5]+ " ";
            if(conditions[3]=="null"){
                $scope.ruleInfo.operator = condtionType;
                $scope.ruleInfo.value = "";
                $scope.ruleInfo.parameter = "";
            }else if(conditions[3] == "exclike"){
                $scope.ruleInfo.operator = " not like ";
                $scope.ruleInfo.value = conditions[4];
                $scope.ruleInfo.parameter = conditions[4];
            }else{
                $scope.ruleInfo.operator = " " + conditions[3] + " ";
                $scope.ruleInfo.value = conditions[4];
                $scope.ruleInfo.parameter = conditions[4];
            }
            $scope.ruleInfo.rightBracket = " " +conditions[5]+ " ";
        }
        $scope.trueOrFalse = false;
        $scope.trueOrFalse_left = false;
        $scope.trueOrFalse_right = false;
        $scope.trueOrFalse_value = false;
        /*$scope.isCanSubmit = true;
        $scope.isCanNew = true;*/
    };
    
    //删除行
    $scope.deleteTableColumn = function($event){
        if (!isTableSelected) {
            alert("请选择一行记录！");
            return false;
        }else{
            $scope.rowsList.splice(selectedIndex, 1);
            $event.stopPropagation();
        }
    };
    
    $scope.ruleInfo = {};
    $scope.confirmColumnValue = function(){
        if ($scope.ruleInfo.field == undefined) {
            alert("字段不能为空！");
            return false;
        }
        
        if ($scope.ruleInfo.operator == undefined || $scope.ruleInfo.operator.length == 0) {
            alert("操作符不能为空！");
            return false;
        }
        
        if ($scope.ruleInfo.operator != undefined && 
                $scope.ruleInfo.operator != " is null " &&
                $scope.ruleInfo.value == undefined) {
            alert("值不能为空！");
            return false;
        }
        
        if ($scope.ruleInfo.leftBracket == undefined) {
            $scope.ruleInfo.leftBracket = "";
        }
        
        if ($scope.ruleInfo.rightBracket == undefined) {
            $scope.ruleInfo.rightBracket = "";
        }
        //值
        var value = $scope.ruleInfo.value;
        //操作符
        var operator = $scope.ruleInfo.operator;
        var codeArray=[];
        if (operator == ' in ') {
            var conditionValues = "";
            if(value != null && value != undefined && value != ''){
                //循环变量列表，判断当前$scope.ruleInfo.parameter的内容，是否与parameterList中的内容相同
                var isParameterSelected = false;
                var keepParam = true;
                angular.forEach($scope.parameterList, function(data, index){
                    if (keepParam) {
                        if ($scope.ruleInfo.parameter == data.codeValue) {
                            isParameterSelected = true;
                            keepParam = false;
                        }
                    }
                })
                codeArray = value.split(",");
                for(var i=0; i<codeArray.length;i++){
                    var type;
                    if ($scope.ruleInfo.field != undefined) {
                        // 获取下拉框的值
                        var typeVal = $scope.ruleInfo.field;
                        var keepGoing = true;
                        angular.forEach($scope.fieldList, function(data, index){
                            if (keepGoing) {
                                if (data.codeValue == typeVal) {
                                    type = data.userDef1;
                                    keepGoing = false;
                                }
                            }
                        })
                        if ("String" == type || "Date" == type) {
                            // 如果使用变量
                            if (isParameterSelected) {
                            } else {
                                // 判断字符第一字符是否为"'"号
                                if ((codeArray[i].substring(0, 1).indexOf("'")) == -1) {
                                    codeArray[i] = "'" + codeArray[i];
                                }
                                // 判断字符最后一个字符是否为"'"号
                                if ((codeArray[i].substring(codeArray[i].length - 1, codeArray[i].length).indexOf("'")) == -1) {
                                    codeArray[i] = codeArray[i] + "'";
                                }
                            }
                        }
                        conditionValues += codeArray[i] +",";
                    }
                }
                var charCode = conditionValues.substring(conditionValues.length-1,conditionValues.length);
                //判断字符最后一个字符是否为","号
                if(charCode.indexOf(",") != -1){
                    conditionValues = conditionValues.substring(0,conditionValues.length-1);    
                }
                value = "(" + conditionValues + ")";
                
                var allocationStrategy = "";
                //如果选择值是变量，则需要[]供后台处理
                if (isParameterSelected) {
                    allocationStrategy = "[" + $scope.ruleInfo.logicalOperator + $scope.ruleInfo.field + $scope.ruleInfo.operator + value + "]";
                }else{
                    allocationStrategy = $scope.ruleInfo.logicalOperator + $scope.ruleInfo.leftBracket + $scope.ruleInfo.field + $scope.ruleInfo.operator + value + $scope.ruleInfo.rightBracket;
                }
                if (selectedIndex != undefined && selectedIndex !== '') {
                    $scope.rowsList[selectedIndex] = allocationStrategy;
                }else{
                    $scope.rowsList.push(allocationStrategy);
                }
                $scope.ruleInfo = {};
                $scope.trueOrFalse = true;
                $scope.trueOrFalse_left = true;
                $scope.trueOrFalse_right = true;
                $scope.trueOrFalse_value = true;
            }
        }
        
        if (operator == ' not in ') {
            var conditionValues = "";
            if(value != null && value != undefined && value != ''){
                //循环变量列表，判断当前$scope.ruleInfo.parameter的内容，是否与parameterList中的内容相同
                var isParameterSelected = false;
                var keepParam = true;
                angular.forEach($scope.parameterList, function(data, index){
                    if (keepParam) {
                        if ($scope.ruleInfo.parameter == data.codeValue) {
                            isParameterSelected = true;
                            keepParam = false;
                        }
                    }
                })
                codeArray = value.split(",");
                for(var i=0; i<codeArray.length;i++){
                    var type;
                    if ($scope.ruleInfo.field != undefined) {
                        // 获取下拉框的值
                        var typeVal = $scope.ruleInfo.field;
                        var keepGoing = true;
                        angular.forEach($scope.fieldList, function(data, index){
                            if (keepGoing) {
                                if (data.codeValue == typeVal) {
                                    type = data.userDef1;
                                    keepGoing = false;
                                }
                            }
                        })
                        if ("String" == type || "Date" == type) {
                            // 如果使用变量
                            if (isParameterSelected) {
                            } else {
                                // 判断字符第一字符是否为"'"号
                                if ((codeArray[i].substring(0, 1).indexOf("'")) == -1) {
                                    codeArray[i] = "'" + codeArray[i];
                                }
                                // 判断字符最后一个字符是否为"'"号
                                if ((codeArray[i].substring(codeArray[i].length - 1, codeArray[i].length).indexOf("'")) == -1) {
                                    codeArray[i] = codeArray[i] + "'";
                                }
                            }
                        }
                        conditionValues += codeArray[i] +",";
                    }
                }
                var charCode = conditionValues.substring(conditionValues.length-1,conditionValues.length);
                //判断字符最后一个字符是否为","号
                if(charCode.indexOf(",") != -1){
                    conditionValues = conditionValues.substring(0,conditionValues.length-1);    
                }
                value = "(" + conditionValues + ")";
                
                var allocationStrategy = "";
                //如果选择值是变量，则需要[]供后台处理
                if (isParameterSelected) {
                    allocationStrategy = "[" + $scope.ruleInfo.logicalOperator + $scope.ruleInfo.field + $scope.ruleInfo.operator + value + "]";
                }else{
                    allocationStrategy = $scope.ruleInfo.logicalOperator + $scope.ruleInfo.leftBracket + $scope.ruleInfo.field + $scope.ruleInfo.operator + value + $scope.ruleInfo.rightBracket;
                }
                if (selectedIndex != undefined && selectedIndex !== '') {
                    $scope.rowsList[selectedIndex] = allocationStrategy;
                }else{
                    $scope.rowsList.push(allocationStrategy);
                }
                $scope.ruleInfo = {};
                $scope.trueOrFalse = true;
                $scope.trueOrFalse_left = true;
                $scope.trueOrFalse_right = true;
                $scope.trueOrFalse_value = true;
            }
        }
        
        if (operator != " is not null " && operator != " in " && operator != " is null " && operator != " not in ") {
            $scope.formatterCondition(value);
        }
        
        //如果操作符是is null
        if (operator == " is null ") {
            var allocationStrategy = $scope.ruleInfo.logicalOperator + $scope.ruleInfo.leftBracket + $scope.ruleInfo.field + $scope.ruleInfo.operator + $scope.ruleInfo.rightBracket;
            
            if (selectedIndex != undefined && selectedIndex !== '') {
                $scope.rowsList[selectedIndex] = allocationStrategy;
            }else{
                $scope.rowsList.push(allocationStrategy);
            }
            $scope.ruleInfo = {};
            $scope.trueOrFalse = true;
            $scope.trueOrFalse_left = true;
            $scope.trueOrFalse_right = true;
            $scope.trueOrFalse_value = true;
        }
        
        //如果操作符是is not null
        if (operator == " is not null ") {
            var allocationStrategy = $scope.ruleInfo.logicalOperator + $scope.ruleInfo.leftBracket + $scope.ruleInfo.field + $scope.ruleInfo.operator + value + $scope.ruleInfo.rightBracket;
            
            if (selectedIndex != undefined && selectedIndex !== '') {
                $scope.rowsList[selectedIndex] = allocationStrategy;
            }else{
                $scope.rowsList.push(allocationStrategy);
            }
            $scope.ruleInfo = {};
            $scope.trueOrFalse = true;
            $scope.trueOrFalse_left = true;
            $scope.trueOrFalse_right = true;
            $scope.trueOrFalse_value = true;
        }
    };
    
    //根据字段下拉框的属性，格式化值
    $scope.formatterCondition = function(objCondition){
        if($scope.ruleInfo.field != undefined){
            //获取下拉框的值
            var typeVal = $scope.ruleInfo.field;
            var type;
            var keepGoing = true;
            angular.forEach($scope.fieldList, function(data, index){
                if (keepGoing) {
                    if (data.codeValue == typeVal) {
                        type = data.userDef1;
                        keepGoing = false;
                    } 
                }
            })
            
            //循环变量列表，判断当前$scope.ruleInfo.parameter的内容，是否与parameterList中的内容相同
            var isParameterSelected = false;
            var keepParam = true;
            angular.forEach($scope.parameterList, function(data, index){
                if (keepParam) {
                    if ($scope.ruleInfo.parameter == data.codeValue) {
                        isParameterSelected = true;
                        keepParam = false;
                    }
                }
            })
            
            //类名——属性名
            if("String" == type || "Date" == type){
                //如果使用变量
                if(isParameterSelected){
                }else{
                   //判断字符第一字符是否为"'"号
                   if( (objCondition.substring(0,1).indexOf("'")) == -1){
                       objCondition ="'"+objCondition;         
                   }
                   //判断字符最后一个字符是否为"'"号
                   if( (objCondition.substring(objCondition.length-1,objCondition.length).indexOf("'")) == -1){
                       objCondition = objCondition+"'";    
                   }
                }
           }
           var allocationStrategy = "";
           //如果选择值是变量，则需要[]供后台处理
           if (isParameterSelected) {
               allocationStrategy = "[" + $scope.ruleInfo.logicalOperator + $scope.ruleInfo.field + $scope.ruleInfo.operator + objCondition + "]";
           }else{
               allocationStrategy = $scope.ruleInfo.logicalOperator + $scope.ruleInfo.leftBracket + $scope.ruleInfo.field + $scope.ruleInfo.operator + objCondition + $scope.ruleInfo.rightBracket;
           }
            
           if (selectedIndex != undefined && selectedIndex !== '') {
               $scope.rowsList[selectedIndex] = allocationStrategy;
           }else{
               $scope.rowsList.push(allocationStrategy);
           }
           $scope.ruleInfo = {};
           $scope.trueOrFalse = true;
           $scope.trueOrFalse_left = true;
           $scope.trueOrFalse_right = true;
           $scope.trueOrFalse_value = true;
        }
    };
    
    function trimStr(str){
        return str.replace(/(^\s*)|(\s*$)/g, "");
    }
    
    $scope.changeRightBracket = function(){
        if ($scope.ruleInfo.leftBracket != undefined) {
            $scope.ruleInfo.rightBracket = " ) ";
        }
    };
    
    $scope.changeBracketStyle = function(){
        var operator = $scope.ruleInfo.operator;
        if ($scope.ruleInfo.parameter != undefined && operator == " is not null ") {
            $scope.ruleInfo.operator = undefined;
        }
        if ($scope.ruleInfo.parameter != undefined) {
            $scope.trueOrFalse_left = true;
            $scope.trueOrFalse_right = true;
            $scope.ruleInfo.logicalOperator = "AND ";
            $scope.trueOrFalse_value = true;
            $scope.ruleInfo.value = $scope.ruleInfo.parameter;
        }else{
            $scope.trueOrFalse_left = false;
            $scope.trueOrFalse_right = false;
            $scope.trueOrFalse_value = false;
            $scope.ruleInfo.value = "";
        }
    };
    
    $scope.changeValueStyle = function(){
        if ($scope.ruleInfo.operator == ' is not null ') {
            $scope.ruleInfo.parameter = "";
            $scope.ruleInfo.value = "";
        }
    }
    
    /** 查询库存分配优先级信息 */
    $scope.searchConditon = {};
    $scope.queryInventoryPriority = function() {
        // 通过查询条件查询数据库
        //波次处理类型
        var launchProcessType = $scope.searchConditon.launchProcessType;
        //分配规则
        var allocationRuleName = $scope.searchConditon.allocationRuleName;
        var priority = $scope.searchConditon.priority;
        $http.post("http://" + $rootScope.domain + "/query/inventory/priority", {
            'launchProcessType' : launchProcessType,
            'allocationRuleName' : allocationRuleName,
            'priority' : priority
        }).success(function(result) {
            if (result.result) {
                $scope.allocationRuleList = result.data;
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
        isSelected = false;
    }

    /** 增加库存分配优先级信息 */
    $scope.addInventoryPriority = function(type) {
        // 为各种下拉框赋值
        $http.get("http://" + $rootScope.domain + "/inventory/priority/initValue").success(function(result) {
            if (result.result) {
                $scope.allocationStrategyList = result.data.allocationStrategyList;
                $scope.fieldList = result.data.fieldList;
                $scope.parameterList = result.data.parameterList;
                $scope.allocationUomList = result.data.allocationUomList;
                $scope.inventoryInfo = {};
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
    
    /** 保存筛单模板信息 */
    $scope.inventoryInfo = {};
    $scope.saveInventoryPriority = function(type) {
        if (($scope.inventoryInfo.launchProcessType == null || $scope.inventoryInfo.launchProcessType == '')) {
            alert("波次处理类型必填");
            return false;
        }
        if (($scope.inventoryInfo.allocationRuleName == null || $scope.inventoryInfo.allocationRuleName == '')) {
            alert("分配规则必填");
            return false;
        }
        if (($scope.inventoryInfo.priority == null || $scope.inventoryInfo.priority == '')) {
            alert("优先级必填");
            return false;
        }
        if (($scope.inventoryInfo.allocationStrategy == null || $scope.inventoryInfo.allocationStrategy == '')) {
            alert("分配策略必填");
            return false;
        }
        if (($scope.inventoryInfo.allocationUom == null || $scope.inventoryInfo.allocationUom == '')) {
            alert("分配单位必填");
            return false;
        }
        if ($scope.inventoryInfo.isActive) {
            $scope.inventoryInfo.isActive = '1';
        }
        var inventoryMatchRule = "";
        angular.forEach($scope.rowsList, function(data, index){
            inventoryMatchRule += data + ";";
        });
        inventoryMatchRule = inventoryMatchRule.substring(0, inventoryMatchRule.length - 1);
        $scope.inventoryInfo.inventoryMatchRule = inventoryMatchRule;
        $scope.inventoryInfo.operationType = type;
        $http.post("http://" + $rootScope.domain + "/save/inventory/priority", $scope.inventoryInfo).success(function(result) {
            if (result.result) {
                SweetAlert.swal({
                    title : result.msg,
                    type : "success",
                    confirmButtonColor : "#007AFF",
                    closeOnConfirm : true
                }, function(isConfirm) {
                    $scope.queryInventoryPriority();
                    isTableSelected = false;
                    $scope.rowsList = [];
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

    /** 删除筛单模板信息 */
    $scope.deleteInventoryPriority = function() {
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
                    $http.post("http://" + $rootScope.domain + "/delete/inventory/priority", {
                        'oubAllocationRuleId' : oubAllocationRuleId
                    }).success(function(result) {
                        if (result.result) {
                            SweetAlert.swal({
                                title : result.msg,
                                type : "success",
                                confirmButtonColor : "#007AFF",
                                closeOnConfirm : true
                            }, function(isConfirm) {
                                $scope.queryInventoryPriority();
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

    /** 查看/编辑库存分配信息 */
    $scope.modifyAllocationInfo = function(id) {
        
        $http.get("http://" + $rootScope.domain + "/query/unique/inventory?oubAllocationRuleId=" + id).success(function(result) {
            if (result.result) {
                $scope.inventoryInfo = result.data.model;
                $scope.launchprocessTypeList = result.data.launchprocessTypeList;
                $scope.allocationStrategyList = result.data.allocationStrategyList;
                $scope.allocationUomList = result.data.allocationUomList;
                $scope.fieldList = result.data.fieldList;
                $scope.parameterList = result.data.parameterList;
                //分配策略列表数据
                $scope.rowsList = result.data.model.inventoryMatchRule.split(";");
                $scope.ruleInfo = {};
                $scope.trueOrFalse = true;
                $scope.trueOrFalse_left = true;
                $scope.trueOrFalse_right = true;
                $scope.trueOrFalse_value = true;
                modify.active = true;
                modify.type = 'modify';
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
}]);