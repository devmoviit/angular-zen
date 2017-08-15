(function(window, angular)
{
    angular.module("Zen.UltraValidate")
           .directive("intOnly", ["CommonValidators", IntOnlyDirective]);

    function IntOnlyDirective(CommonValidators)
    {
        return {
            restrict: "A",
            require: "ultraValidate",
            priority: 1000,
            link: (scope, element, attrs, ultraValidate) =>
            {
                scope.RegisterValidator(CommonValidators.IntOnly, "intOnly");
            }
        };
    }
})(window, angular);