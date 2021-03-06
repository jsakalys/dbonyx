angular.module('UserCtrls', [])
.factory('onyxUser', ['$http',function($http){
	var user = {loggedin:false}
	$http({
		method: 'GET',
		url: '/api/user/getUser'
	}).then(function success(response){
		user.username=response.data.username
		user.email=response.data.email
		user.loggedin=true
	},function error(response){
		// console.log(response)
	})

	return user
}])
.controller('validateCtrl', ['$http','$location','$scope', '$routeParams', function($http,$location,$scope,$routeParams){
	//validates user's email (by clicking link created and sent to email)
	$http({
		method: 'POST',
		url: '/api/user/validate',
		data: {username:$routeParams.user,validateString:$routeParams.validateString}
	}).then(function success(response){
		// console.log("Success!")
		$location.url('/')
	},function error(response){
		//TODO:Handle login error
		$scope.error=response.data.error
	})
}])
.controller('userCtrl', ['onyxUser','$scope','$http','$location',function(onyxUser,$scope,$http,$location){
	$scope.user=onyxUser
	$scope.register=false
	$scope.login = {}
	$scope.showUserPanel=false
	$scope.showRegister=function(){
		$scope.register=!$scope.register
		// console.log($scope.register)
	}
	$scope.login=function(){
		// console.log('a')
		$http({
			method: 'POST',
			url: '/api/user/login',
			data: {email:$scope.login.email,password:$scope.login.password}
		}).then(function success(response){
			// console.log($scope.user)
			$scope.user.username=response.data.username
			$scope.user.email=response.data.email
			$scope.user.loggedin=true
		},function error(response){
			//TODO: Hanlde login error
		})
	}
	$scope.register=function(){
		$http({
			method: 'POST',
			url: '/api/user/register',
			data: {username:$scope.username,email:$scope.email,password1:$scope.password1,password2:$scope.password2}
		}).then(function success(response){
			$scope.user.username=''
			$scope.user.email=''
			$scope.user.loggedin=false
			$location.url('/')
		},function error(response){
			//TODO: handle register error
		})
	}
	$scope.logout=function(){
		$http({
			method: 'POST',
			url: '/api/user/logout'
		}).then(function success(response){
			$scope.user.username=''
			$scope.user.email=''
			$scope.user.loggedin=false
			$location.url('/')
		},function error(response){
			//TODO: handle logout error
		})
	}
	$scope.toggleUserPanel = function(){
		$scope.showUserPanel = !$scope.showUserPanel
	}
}])