/*
 * Translations are expected in the following form:
 * {
 *    [PropertyName]: {
 *        display: "User friendly name",
 *        [Key1]: "Error message {{name}} {{value}} {{otherName}} {{otherValue}}",
 *        [Key2]: "Error message"
 *    }
 * }
 * 
 * Example:
 * validations: {
 *     Password: {
 *         display: "contraseña",
 *         pattern: "La contraseña debe mezclar numeros y letras"
 *     },
 *     ConfirmPassword: {
 *         display: "confirmar contraseña"
 *         isSame: "La contraseña no coincide con {{otherName}}"
 *     }
 * } * 
 */
(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .service("DefaultValidationHandler", ["$compile", "$translate", DefaultValidationHandlerService]);

    function DefaultValidationHandlerService($compile, $translate)
    {
        var self = this;

        // The translation Id of the default validation message
        var DefaultErrorMessagesPath = "validations";
        var DefaultErrorMessage = `${DefaultErrorMessagesPath}.invalid`;

        function CreateUltraValidateIcon(scope, element, attrs)
        {
            var iconHtml = "<ultra-validate-icon/>";

            var icon = angular.element(iconHtml);

            $compile(icon)(scope);

            element.after(icon);
        }

        this.Init = (scope, element, attrs) =>
        {
            CreateUltraValidateIcon(scope, element, attrs);
        };

        this.HandleValid = (modelValue, viewValue, context, key, element) => { };

        this.HandleInvalid = (modelValue, viewValue, context, key, element) => { };

        this.ComposeFullErrorMessage = (errors, context) =>
        {
            return _.reduce(errors, (message, error, key) => `${self.ComposeErrorMessage(key, context)}<br/>${message}`, "");
        };

        this.ComposeErrorMessage = (key, context) =>
        {
            // Get the values to pass to the translation service
            var translationValues = GetTranslationValues(key, context);
            // Generate the translation id for the message
            var translationId = CreateTranslationId(key, context);

            // Attempt translation
            var translation = $translate.instant(translationId, translationValues);

            // If translation failed try treating as a well known validation (e.g. required, min, maxlength, etc.)
            if (translation === translationId)
            {
                var wellKnownId = `${DefaultErrorMessagesPath}.${key}`;

                translation = $translate.instant(wellKnownId, translationValues);

                // If failed to translate as well known validation message, return the default generic error message
                if (translation === wellKnownId) return $translate.instant(DefaultErrorMessage, translationValues);
            }

            return translation;
        };

        function CreateTranslationId(key, context)
        {
            var translationsPath = context.Messages;

            // If no Messages property specified, use the default path
            var translationId = translationsPath ? `${translationsPath}.${context.ValidatedProperty}` : DefaultErrorMessagesPath;

            // If a key was specified for the validation, use it
            if (key !== "ultraValidate")
                translationId = translationId + `.${key}`;

            return translationId;
        }

        function GetTranslationValues(key, context)
        {
            var rule = context.GetRule(key);
            var otherProperty = rule && rule.against;

            return {
                name: context.ValidatedProperty,
                value: context.GetValue(),
                otherName: otherProperty,
                otherValue: context.GetOtherValue(otherProperty)
            };
        }
    }
})(window, angular);