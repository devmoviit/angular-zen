(function(window, angular)
{
    angular.module("Zen.UltraValidate")
           .directive("ultraValidateIcon", [IconDirective]);

    function IconDirective()
    {
        return {
            restrict: "E",
            template: "<span class='badge badge-danger badge-sm' ng-show='ShouldShowErrors()' uib-tooltip-html='ComposeErrors()' tooltip-enable='{{ShouldShowErrors()}}' tooltip-append-to-body='true'>{{GetErrorCount()}}</span>"
        };
    }
})(window, angular);