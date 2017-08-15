(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .factory("UltraValidateValidator", ["UltraValidateExpression", "UltraValidateWatch", ValidatorFactory]);

    function ValidatorFactory(UltraValidateExpression, UltraValidateWatch)
    {
        // expression can be an expression or a validation config object (e.g. { validateIf: ..., validate: ... })
        function UltraValidateValidator(name, scope, ngModel, context, expression)
        {
            var self = this;

            this.ValidateIfExpression = null;
            this.ValidateExpression = null;
            this.IsConditioned = false;
            this.DirtyOnly = true;
            this.ValidateEmpty = false;
            this.IsAsync = false;
            this.Watch = null;

            function Initialize()
            {
                // Wrap the validateIf in an expression object to enable dynamically evaluating it everytime validation runs
                self.ValidateIfExpression = new UltraValidateExpression(expression.validateIf, scope);
                // Wrap the validate in an expression object to enable dynamically evaluating it everytime validation runs
                self.ValidateExpression = new UltraValidateExpression(expression || expression.validate, scope);

                // Determine if the ValidateIfExpression should be used during validation
                self.IsConditioned = !!expression.validateIf;
                // Determine whether to start validation only when field because dirty or not
                self.DirtyOnly = expression.dirtyOnly || self.DirtyOnly;
                // Determine whether to run the validation prodedure on null and undefined values
                self.ValidateEmpty = _.isUndefined(expression.validateEmpty) ? self.ValidateEmpty : expression.validateEmpty;
                // Determine whether the validation is to be executed async
                self.IsAsync = !!expression.isAsync;

                if (expression.watch)
                {
                    var watched = expression.watch;
                    var deepWatch = expression.deepWatch || false;
                    var collectionWatch = expression.collectionWatch; // undefined is allowed as UltraValidateWatch can deduce the type of watch automatically

                    self.Watch = new UltraValidateWatch(watched, collectionWatch, deepWatch, context, scope, ngModel);
                }
            }

            this.Run = (modelValue, viewValue) =>
            {
                var args = [modelValue, viewValue];

                // If value is null or undefined and nulls shouldn't be validated, skip validation and signal valid
                if ((modelValue === undefined || modelValue === null) && !self.ValidateEmpty) return true;
                // If shouldn't validate, skip validation and signal valid
                if (self.IsConditioned && self.ValidateIfExpression.IsFalse(context, args)) return true;
                // If field is not yet dirty and shouldn't be validated as pristine nor touched, skip validation and signal valid
                if (self.DirtyOnly && !ngModel.$dirty) return true;

                // Signal validity to scope so the controller can handle it
                var isValid = self.ValidateExpression.IsTrue(context, args);
                // Execute controller callback
                isValid ? scope.OnValid(modelValue, viewValue, context, name) : scope.OnInvalid(modelValue, viewValue, context, name);

                return isValid;
            };

            Initialize();
        }

        return UltraValidateValidator;
    }
})(window, angular);