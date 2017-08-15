(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .directive("maxPrecision", ["CommonValidators", MaxPrecisionDirective]);

    function MaxPrecisionDirective(CommonValidators)
    {
        return {
            restrict: "A",
            require: "ultraValidate",
            priority: 1000,
            link: (scope, element, attrs, ultraValidate) =>
            {
                var maxPrecision = parseInt(attrs.maxPrecision);

                if (_.isUndefined(maxPrecision))
                    throw "max-precision wasn't assigned with a value.";

                // The following optimizes the validation by using already instantiated validators in case of 1-4 precision
                var validator = maxPrecision > 4 ? CommonValidators.CreateMaxPrecisionValidator(maxPrecision) :
                                                   CommonValidators["MaxPrecision" + maxPrecision];
                
                scope.RegisterValidator(validator, "maxPrecision");
            }
        };
    }
})(window, angular);