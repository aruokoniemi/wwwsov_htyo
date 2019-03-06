"use strict";

var modalRegister = carGameApp.service("modalRegister", function ($modal, $rootScope) {
  return function() {
    var instance = $modal.open({
      templateUrl: '/components/register/modalRegister.html',
      controller: 'registerController',
    })

    return instance;
  };

});