/*
 * Handles validation events and exposes functionality API to any requiring directive or validation handler.
 * This controller is directly instantiated from ultra-validate.
 * 
 * When developing a different ValidationHandler, the UltraValidateController's API can be used in the HTML to retreive the validation state, errors, etc.
 */
(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .controller("UltraValidateController", ["$scope", "$element", "$attrs", "$timeout", "UltraValidateValidator", "ValidationHandler", UltraValidateController]);

    function UltraValidateController($scope, $element, $attrs, $timeout, UltraValidateValidator, ValidationHandler)
    {
        // References the ngModel.$error object
        $scope.Errors = {};
        // References the UltraValidateContext object created by ultra-validate
        $scope.Context = {};

        function Initialize()
        {
            ValidationHandler.Init($scope, $element, $attrs, 0);
        }

        // Checks whether the value has errors or is valid
        $scope.IsValid = () => _.isEmpty($scope.Errors);

        $scope.ShouldShowErrors = () => !$scope.IsValid() && $scope.Context.ngModel.$dirty;

        // Calls the handler and pass it the element as well
        $scope.OnValid = (modelValue, viewValue, context, key) =>
        {
            SetNativeValid(true);

            ValidationHandler.HandleValid(modelValue, viewValue, context, key, $element);
        };

        // Calls the handler and pass it the element as well
        $scope.OnInvalid = (modelValue, viewValue, context, key) =>
        {
            SetNativeValid(false);

            ValidationHandler.HandleInvalid(modelValue, viewValue, context, key, $element);
        };

        $scope.GetErrorCount = () => _.size($scope.Errors);

        $scope.ComposeErrors = () => ValidationHandler.ComposeFullErrorMessage($scope.Errors, $scope.Context);

        function SetNativeValid(isValid)
        {
            // Angular custom validations don't set :invalid pseudo state on the element
            // This is done manually to make the browser understand that the input is now invalid and should be styled appropriately
            $element[0].setCustomValidity(isValid ? "" : "Invalid");
        }

        $scope.RegisterValidator = (expression, name) =>
        {
            var context = $scope.Context;
            var ngModel = context.ngModel;

            var validator = new UltraValidateValidator(name, $scope, ngModel, context, expression);
            var collection = validator.IsAsync ? ngModel.$asyncValidators : ngModel.$validators;

            collection[name] = validator.Run;
        };

        Initialize();
    }
})(window, angular);