'use strict';

app.controller('workRuleCtrl', [ "$rootScope", "$scope", "$http", "$window", "$modal", "$filter", "SweetAlert", function($rootScope, $scope, $http, $window, $modal, $filter, SweetAlert) {

	var vm = $scope.vm = {};
    var customer = $scope.customer = {};
    var condition = $scope.condition = {};
    var statistic = $scope.statistic = {};
    var modify = $scope.modify = {};
    
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
    
    // 为下拉框赋值，后期为所有下拉框编写下拉框自定义指令
//    $http.post("http://" + $rootScope.domain + "/query/workTypes").success(function(result) {
//        if (result.result) {
//            $scope.workTypeList = result.data;
//        } else {
//            SweetAlert.swal({
//                title: result.msg,
//                type: "error",
//                confirmButtonColor: "#007AFF",
//                closeOnConfirm: true
//            });
//        }
//    }).error(function(result) {
//        alert("系统异常，请稍后重试");
//    });
    
    //伪数据
    $scope.workTypeList = [
                           {
                        	      code: '001',
                        	      label: '工作类型1'
                        	    },
                        	    {
                        	      code: '002',
                        	      label: '工作类型2'
                        	    },
                        	    {
                        	      code: '003',
                        	      label: '工作类型3'
                        	    },
                        	    {
                        	      code: '004',
                        	      label: '工作类型4'
                        	    }
                        	  ];  
      

    /** 查询工作规则数据 */
    $scope.searchConditon = {};
    $scope.workRuleList = [];

    $scope.queryWorkRules = function() {
        var ruleName = $scope.searchConditon.ruleName;
        var workType = $scope.searchConditon.workType;  
        
        //与服务器交互
//        $http.post("http://" + $rootScope.domain + "/query/work_rule", {
//            'ruleName' : ruleName,
//            'workType' : workType
//        }).success(function(result) {
//            if (result.result) {
//                $scope.templateList = result.data;
//            } else {
//                SweetAlert.swal({
//                    title: result.msg,
//                    type: "error",
//                    confirmButtonColor: "#007AFF",
//                    closeOnConfirm: true
//                });
//            }
//        }).error(function(result) {
//            alert("系统异常，请稍后重试");
//        }); 
        
        //伪数据
        if($scope.workRuleList.length < 1){
            $scope.workRuleList = [
                                   {
                                	 workRuleID:'001',
                                	 workRuleName:'工作规则1',
                                	 workType:'工作类型1',
                                	 priority:'1',
                                	 is_active:'1'
                                   },
                                   {
                                  	 workRuleID:'002',
                                  	 workRuleName:'工作规则2',
                                  	 workType:'工作类型1',
                                  	 priority:'1',
                                  	 is_active:'1'
                                     }
                                   
                                   ];          	
        }
    
        
    	statistic.active = true;
    	vm.allChecked = false;
    }  
    
    //全选
	vm.checkAll = function(checked) {
		angular.forEach($scope.workRuleList, function(aWorkType) {
			aWorkType.$checked = checked;
		});
	};
    //选中记录  
//	vm.selection = function() {
//		return _.where($scope.workRuleList, {$checked: true});
//	};

    /** 删除工作规则数据 */

    $scope.deleteWorkRule = function() {
    	var workRuleList = [];
    	var delWrokRuleID = [];
		angular.forEach($scope.workRuleList, function(aWorkType) {
			if(aWorkType.$checked == true){
				delWrokRuleID.push(aWorkType.workRuleID);
			}else{
				workRuleList.push(aWorkType);
			}
		});  
		
		
		//delete from databse
		//params:['001','002','003']

		vm.delWrokRuleID = delWrokRuleID;
		
		if (delWrokRuleID.length<1) {
            //alert("请选择一行记录！");
//            SweetAlert.swal({
//        		title : '请最少选择一行记录',
//        		type : "warning",
//        		confirmButtonColor : "#007AFF",
//        		closeOnConfirm : true
//    		});
            SweetAlert.swal({title: "请最少选择一行记录!",   text: "I will close in 2 seconds.",   timer: 2000,   showConfirmButton: false });
            return false;
        }else{
        	SweetAlert.swal({
                title: "确认是否删除当前记录?",
                type: "warning",
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确认",
                closeOnConfirm: false
                },
                function(){
                	//与服务器交互
//                    $http.post("http://" + $rootScope.domain + "/delete/work_rule", {
//                        'delWrokRuleID' : delWrokRuleID
//                    }).success(function(result) {
//                        if (result.result) {
//                            SweetAlert.swal({
//                                title : result.msg,
//                                type : "success",
//                                confirmButtonColor : "#007AFF",
//                                closeOnConfirm : true
//                            }, function(isConfirm) {
//                                $window.location.reload();
//                            });
//                        } else {
//                            SweetAlert.swal({
//                                title: result.msg,
//                                type: "error",
//                                confirmButtonColor: "#007AFF",
//                                closeOnConfirm: true
//                            });
//                        }
//                    }).error(function(result) {
//                        alert("系统异常，请稍后重试");
//                    });
                	//伪代码
                	SweetAlert.swal({
	                		title : '删除成功',
	                		type : "success",
	                		confirmButtonColor : "#007AFF",
	                		closeOnConfirm : true
                		}, function(isConfirm) {
                			//$window.location.reload();
                			$scope.workRuleList = workRuleList;
                			$scope.queryWorkRules();
                	});
                	
                    
                });         	
        	
        }
    	
    }
	

    //新增记录
    $scope.ruleModel = {};
    $scope.addWorkRule = function(flag) {
    	if('new' == flag){
    		
    	}
    	if('new' == flag){
    		
    	}  
    	modify.active = true;
    }


	//条件
	$scope.whereModel = [];

	vm.addCondition = function(){

		var whereMap = {};
		whereMap.logicOperator = vm.logicOperator !== undefined?vm.logicOperator.trim():vm.logicOperator;
		whereMap.leftBracket = vm.leftBracket !== undefined?vm.leftBracket.trim():vm.leftBracket;
		whereMap.rightBracket = vm.rightBracket !== undefined?vm.rightBracket.trim():vm.rightBracket;
		whereMap.fieldLabel = (vm.field !== undefined && vm.field.label !== undefined)?vm.field.label.trim():undefined;
		whereMap.fieldType = (vm.field !== undefined && vm.field.fieldType !== undefined)?vm.field.fieldType.trim():undefined;
		whereMap.operator = vm.operator !== undefined?vm.operator.trim():vm.operator;
		whereMap.value = vm.value !== undefined?vm.value.trim():vm.value;

		if(whereMap.fieldLabel === undefined)
			return false;

		if(whereMap.operator === undefined)
			return false;



		var whereString = "";

		whereString += whereMap.logicOperator;

		//左括号
		if(whereMap.leftBracket != undefined){
			whereString += " " + whereMap.leftBracket;
		}else{
			whereString += " ";
		}

		whereMap.fieldType = 'String';
		//"AND 工作类型1 > '12'"
		if(('String' == whereMap.fieldType || 'data' == whereMap.fieldType)  && whereMap.fieldType !== undefined){
			whereString += " " + whereMap.fieldLabel;
			//AND 工作类型1
			whereString += " " + whereMap.operator;


			//操作符处理
			if('in' == whereMap.operator || 'not in' == whereMap.operator){
				whereString += " (";
				if(whereMap.value != undefined && whereMap.value.split(',').length>0){
					var values = whereMap.value.split(',');
					var newValue = "";
					for(var i=0;i<values.length;i++){
						if(i == 0){
							newValue += "'"+values[i]+"'";
						}else{
							newValue += ",'"+values[i]+"'";
						}

						console.log("newValue:"+newValue);
					}
					whereString += newValue;

				}else{
					whereString += whereMap.value;
				}
				whereString += ")";
			}else{
				whereString += " '" + whereMap.value + "'";
			}


		}


		//右括号
		if(whereMap.rightBracket != undefined){
			whereString += " " + whereMap.rightBracket;
		}else{
			whereString += " ";
		}

		console.log("sql:"+whereString);

		var object = {};
		//object.whereString = whereString.replace(/\ /g,'&nbsp;');

		object.whereString = whereString;



		$scope.whereModel.push(object);

		//初始化条件结果区,默认选中所添加项
		vm.checkonebox($scope.whereModel.length-1);





	};

	//get parameter from where condition String by index
	vm.getParameter = function(whereString,idx) {

		if (whereString == undefined || idx == undefined) {
			return '';
		}

		//还原
		if (whereString.indexOf('not in') > 0 || whereString.indexOf('is null') > 0 || whereString.indexOf('not like') > 0 || whereString.indexOf('is not like') > 0) {
			whereString = whereString.replace('not in', 'notin').replace('is null', 'isnull').replace('not like', 'notlike').replace('is not like', 'isnotlike');
		}
		var whereCondition = whereString.split(' ');

		for (var i = 0; i < whereCondition.length; i++) {

			if (idx == i) {
				return whereCondition[i];

				if (whereCondition[i] == 'notin') {
					return "not in";
				} else if (whereCondition[i] == 'isnull') {
					return "is null";
				} else if (whereCondition[i] == 'notlike') {
					return "not like";
				} else if (whereCondition[i] == 'isnotlike') {
					return "is not like";
				}
				else {
					return whereCondition[i];
				}

			}
		}
	};

	//checkbox单选功能,grid回显
	vm.checkonebox = function(index){

		var whereString = "";
		angular.forEach($scope.whereModel, function(whereMap,idx) {
			whereMap.$checked = false;
			if(index == idx){
				whereMap.$checked = true;
				whereString = whereMap.whereString;
			}
		});
		//whereString: "AND 工作类型3 > 'ii'"
		var operator = vm.getParameter(whereString,0);


		//AND ( 工作类型3 like '45%' )

		//AND ( 工作类型1 = '12' )

		//条件区ui一致
		vm.logicOperator = " " + vm.getParameter(whereString,0) + " ";
		vm.leftBracket = " " + vm.getParameter(whereString,1) + " ";


		vm.field.label = " " + vm.getParameter(whereString,2) + " ";


		vm.operator = " " + vm.getParameter(whereString,3) + " ";
		vm.rightBracket = " " + vm.getParameter(whereString,5) + " ";

		//var s = "LOVE LIFE ！ LOVE JAVA ...";
		//alert(s);
        //
		//alert(s.replace("LOVE ", "爱"));
		//alert(s.replace(/\LOVE/g, "爱"));
		console.log("whereString:"+whereString);
		console.log("key:"+vm.getParameter(whereString,4));

		vm.value = vm.getParameter(whereString,4).replace(/\(/g,'').replace(/\)/g,'').replace(/\'/g,'');

	};
   
    //排序
   $scope.orderModel = {};
   $scope.orderModel.orderBy = 'asc';
   
   var orderMap = new vip.HashMap();
   vm.addOrderby = function(){
	   if($scope.orderModel.orderColumn == undefined){
           SweetAlert.swal({title: "请最少选择一个排序字段!",   text: "I will close in 2 seconds.",   timer: 2000,   showConfirmButton: false });
           return false;		   
	   }else{
		   var key = $scope.orderModel.orderColumn.code;
		   var object = {};
		   object.code = key;
		   object.label = $scope.orderModel.orderColumn.label;
		   object.orderBy = $scope.orderModel.orderBy;;
		   orderMap.put(key,object);  
	   }
       $scope.orderList = orderMap.values();
   };
   
   vm.deleteOrderby = function(){
	   
	   var num = 0;
	   for(var i in $scope.orderList){
		   if($scope.orderList[i].$checked == true){
			   var key = $scope.orderList[i].code;
			   orderMap.remove(key);
			   num =+ 1;
		   }
	   }
	   if(num == 0){
           SweetAlert.swal({title: "请最少选择一个删除记录!",   text: "I will close in 2 seconds.",   timer: 2000,   showConfirmButton: false });
           return false;				   
	   }else{
		   var list = [];
		   for(var i in $scope.orderList){
			   if($scope.orderList[i].$checked == false || $scope.orderList[i].$checked == undefined){
				   list.push($scope.orderList[i]); 
			   } 
		   }
		   $scope.orderList = list;
	   }
	   
   };
   
   //分组
   $scope.groupModel = {};
   
   var groupMap = new vip.HashMap();
   vm.addGroupby = function(){
	   if($scope.groupModel.groupColumn == undefined){
           SweetAlert.swal({title: "请最少选择一个分组字段!",   text: "I will close in 2 seconds.",   timer: 2000,   showConfirmButton: false });
           return false;		   
	   }else{
		   var key = $scope.groupModel.groupColumn.code;
		   var object = {};
		   object.code = key;
		   object.label = $scope.groupModel.groupColumn.label;
		   groupMap.put(key,object);  
	   }
       $scope.groupList = groupMap.values();
   };
   
   vm.deleteGroupby = function(){
	   
	   var num = 0;
	   for(var i in $scope.groupList){
		   if($scope.groupList[i].$checked == true){
			   var key = $scope.groupList[i].code;
			   groupMap.remove(key);
			   num =+ 1;
		   }
	   }
	   if(num == 0){
           SweetAlert.swal({title: "请最少选择一个分组记录!",   text: "I will close in 2 seconds.",   timer: 2000,   showConfirmButton: false });
           return false;				   
	   }else{
		   var list = [];
		   for(var i in $scope.groupList){
			   if($scope.groupList[i].$checked == false || $scope.groupList[i].$checked == undefined){
				   list.push($scope.groupList[i]); 
			   } 
		   }
		   $scope.groupList = list;
	   }
	   
   } 
   


   
}]);
/**
 * *********  操作实例  **************
 *	var map = new vip.HashMap();
 *	map.put("key1","Value1");
 *	map.put("key2","Value2");
 *	map.put("key3","Value3");
 *	map.put("key4","Value4");
 *	map.put("key5","Value5");
 *	alert("size："+map.size()+" key1："+map.get("key1"));
 *	map.remove("key1");
 *	map.put("key3","newValue");
 *	var values = map.values();
 *	for(var i in values){
 *		document.write(i+"："+values[i]+"   ");
 *	}
 *	document.write("<br>");
 *	var keySet = map.keySet();
 *	for(var i in keySet){
 *		document.write(i+"："+keySet[i]+"  ");
 *	}
 *	alert(map.isEmpty());
 */
var vip=vip||{};vip.HashMap=function(){var length=0;var obj=new Object();this.isEmpty=function(){return length==0};this.containsKey=function(key){return(key in obj)};this.containsValue=function(value){for(var key in obj){if(obj[key]==value){return true}}return false};this.put=function(key,value){if(!this.containsKey(key)){length++}obj[key]=value};this.get=function(key){return this.containsKey(key)?obj[key]:null};this.remove=function(key){if(this.containsKey(key)&&(delete obj[key])){length--}};this.values=function(){var _values=new Array();for(var key in obj){_values.push(obj[key])}return _values};this.keySet=function(){var _keys=new Array();for(var key in obj){_keys.push(key)}return _keys};this.size=function(){return length};this.clear=function(){length=0;obj=new Object()}};


String.prototype.trim=function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.ltrim=function(){
	return this.replace(/(^\s*)/g,"");
}
String.prototype.rtrim=function(){
	return this.replace(/(\s*$)/g,"");
}