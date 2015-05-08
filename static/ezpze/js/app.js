
angular.module('ezpzeApp', ['ngRoute', 'btford.socket-io'])

.config(['$httpProvider', '$routeProvider', '$locationProvider',
  function ($httpProvider, $routeProvider, $locationProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $routeProvider
      .when('/', {
        title: 'Home',
        templateUrl: '/templates/ng-view/home.html',
        controller: 'HomeCtrl',
      })
      .when('/arr', {
        title: 'Home',
        templateUrl: '/templates/ng-view/home.html',
        controller: 'HomeCtrl',
      })
      .when('/calculator', {
        title: 'Calculator',
        templateUrl: '/templates/ng-view/calculator.html',
        controller: 'CalculatorCtrl',
      });

}]);
