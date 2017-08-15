(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .directive("ultraValidate", ["UltraValidateExpression", "UltraValidateContext", UltraValidateDirective]);

    function UltraValidateDirective(UltraValidateExpression, UltraValidateContext)
    {
        // TODO: Validator plugins (e.g. email, rut, phone, numeric)
        // TODO: ModelState auto handling
        // TODO: Validate even if no ngModel

        function GetValidationContext(scope, element, attrs, ngModel)
        {
            // Get the path to the bound property
            var modelPath = attrs.ngModel;
            // Extract the name (the path) of the object containing the validated property excluding the property name
            var expression = modelPath.substring(0, _.lastIndexOf(modelPath, "."));
            // Evaluate to get the object itself
            var context = new UltraValidateExpression(expression, scope).Eval();
            // Get any other validators added with uv-also and parse them (pass context in case user passed a validation function)
            var customValidators = new UltraValidateExpression(attrs.uvAlso, scope).Eval(context); // Evaluate any other custom validations

            return new UltraValidateContext(context, element, ngModel, modelPath, customValidators);
        }

        function AddValidators(scope, ngModel, context, validators)
        {
            // If this is an expression (e.g. 'x === 3', 'model.HasThings()', etc.),
            // or this is a configuration object (e.g. { validateIf: ..., validate: ... } )
            // parse it as an object to pass it through the loop
            if (_.isString(validators) ||
                _.isFunction(validators) ||
                _.isObject(validators) && validators.validate)
                validators = { ultraValidate: validators };

            _(validators).each(scope.RegisterValidator);
        }

        return {
            require: "^ngModel",
            restrict: "A",
            controller: "UltraValidateController",
            link: ($scope, element, attrs, ngModel) =>
            {
                var context = GetValidationContext($scope, element, attrs, ngModel); // Get the object containing the property

                // Expose objects to UltraValidateController
                $scope.Errors = ngModel.$error;
                $scope.Context = context;

                if (context.Rules)
                    AddValidators($scope, ngModel, context, context.Rules);

                if (context.CustomValidators)
                    AddValidators($scope, ngModel, context, context.CustomValidators);
            }
        };
    }
})(window, angular);