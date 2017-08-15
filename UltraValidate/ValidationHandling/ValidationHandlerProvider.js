(function(window, angular)
{
    angular.module("Zen.UltraValidate")
           .provider("ValidationHandler", [ValidationHandlerProvider]);

    function ValidationHandlerProvider()
    {
        var defaultHandlerServiceName = "DefaultValidationHandler";

        var handlerName = defaultHandlerServiceName;

        return {
            // Enable replacing the default validation handler with a different one
            set: handlerServiceName => handlerName = handlerServiceName,
            // Tell angular to instantiate the handler service, and return it
            $get: [handlerName, (handler) => handler]
        };
    }
})(window, angular);