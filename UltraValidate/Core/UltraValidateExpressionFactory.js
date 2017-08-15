(function(window, angular)
{
    angular.module("Zen.UltraValidate")
           .factory("UltraValidateExpression", [ExpressionFactory]);

    function ExpressionFactory()
    {
        return function UltraValidateExpression(expression, scope)
        {
            var self = this;

            this.Eval = eval;

            this.IsTrue = (context, args) => !!eval(context, args);
            this.IsFalse = (context, args) => !eval(context, args);
            this.IsFunction = (context, args) => _.isFunction(eval(context, args));
            this.IsObject = (context, args) => _.isObject(eval(context, args));
            this.IsArray = (context, args) => _.isArray(eval(context, args));
            this.IsArrayOrObject = (context, args) =>
            {
                var value = eval(context, args);

                return _.isArray(value) || _.isObject(value);
            };
            this.IsPromise = (context, args) =>
            {
                var result = eval(context, args);

                return result && _.isFunction(result.then);
            };
            this.EvaluatesToValue = (context, args) =>
            {
                var exp = eval(context, args);

                return _.isBoolean(exp) || _.isString(exp) || _.isNumber(exp) || _.isDate(exp) || _.isNull(exp) || _.isUndefined(exp);
            };

            // The core function that evaluates expressions
            function eval(context, args)
            {
                context = context || {};
                args = args || [];

                if (_.isUndefined(expression)) return undefined;

                if (_.isFunction(expression)) return expression(...args, context);

                if (_.isObject(expression) && expression.validate) return _.isArray(expression.validate) ? injectEval(expression.validate, args, context) : expression.validate(...args, context);

                if (_.isArray(expression)) return injectEval(expression, args, context);

                var value = scope.$eval(expression);

                return _.isFunction(value) ? value(...args, context) : value;
            }

            function injectEval(array, args, context)
            {
                var injected = _.initial(array);
                var validate = _.last(array);

                if (!_.isFunction(validate))
                    throw `The last element of the array should be a validation function (${context})`;

                // Build expressions for all expressions to be injected
                var values = _.map(injected, (exp) => new UltraValidateExpression(exp, scope).Eval(context, args));

                return validate(...args, context, ...values);
            }
        }
    }
})(window, angular);