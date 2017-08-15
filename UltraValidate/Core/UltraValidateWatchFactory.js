(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .factory("UltraValidateWatch", ["UltraValidateExpression", WatchFactory]);

    function WatchFactory(UltraValidateExpression)
    {
        /// <summary>Starts and returns the watch that will automatically call the $validate function of ngModel.</summary>
        /// <param name="scope">The scope on which the watch should be applied.</param>
        /// <param name="ultraExpresssion">The UltraValidateExpression object that contains the expression to watch.</param>
        /// <param name="collectionWatch">
        /// true to use $watchCollection, false to use $watch.
        /// If undefined, the function will evaluate the expression once and deduce the watch type automatically according to the value type.
        /// </param>
        /// <param name="deep">true to watch for deep changes in objects; otherwise false. (Only applies to collection watches).</param>
        /// <param name="ngModel">The ngModel controller that will be used to run the validations.</param>
        /// <returns>The angular watch object.</returns>
        function Watch(scope, ultraExpression, collectionWatch, deep, ngModel)
        {
            var onChange = ngModel.$validate;
            var watchCollection = () => scope.$watchCollection(ultraExpression.Eval, onChange);
            var watch = () => scope.$watch(ultraExpression.Eval, onChange, deep);

            // If no watch type specified, deduce according to value type
            // Arrays and objects will be automatically watched as collections, everything else as normal watch
            if (_.isUndefined(collectionWatch)) return ultraExpression.IsArrayOrObject() ? watchCollection() : watch();

            // If watch should be as a collection, create a collection watch
            if (collectionWatch) watchCollection();

            // Create a normal watch
            return watch();
        }

        /// <summary>Starts and returns the watch that will automatically call the $validate function of ngModel.</summary>
        /// <param name="scope">The scope on which the watch should be applied.</param>
        /// <param name="ultraExpresssion">The UltraValidateExpression object that contains the expression to watch.</param>
        /// <param name="collectionWatch">
        /// true to use $watchCollection, false to use $watch.
        /// If undefined, the function will evaluate the expression once and deduce the watch type automatically according to the value type.
        /// </param>
        /// <param name="deep">true to watch for deep changes in objects; otherwise false. (Only applies to collection watches).</param>
        /// <param name="context">The UltraValidateContext holding information of the current validation context.</param>
        /// <param name="ngModel">The ngModel controller that will be used to run the validations.</param>
        /// <returns>The angular watch object.</returns>
        return function UltraValidateWatch(expression, collectionWatch, deep, context, scope, ngModel)
        {
            var watched = expression;

            // If the expression is a string, figure out what it holds
            if (_.isString(expression))
            {
                // If this is not a property name but rather a scope expression to evaluate (i.e. interpolation string of the form "{{expression}}")
                // Remove the curly brackets and use the expression inside
                if (_.startsWith(expression, "{{") && _.endsWith(expression, "}}"))
                {
                    expression = expression.replace("{{", "").replace("}}", "");

                    watched = expression;
                }
                else // If this is not a scope expression to evaluate, treat as a property name within the same context
                    // Generate a watch function that gets the value of the specified property
                    watched = () => context.GetOtherValue(expression);
            }

            var ultraExpression = new UltraValidateExpression(watched, scope);

            this.Watch = Watch(scope, ultraExpression, collectionWatch, deep, ngModel);
        };
    }
})(window, angular);