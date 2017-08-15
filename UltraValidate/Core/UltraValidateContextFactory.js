/*
 * Holdes information of the current validation context, allowing quick access to information when needed throughout the validation process.
 */
(function (window, angular)
{
    angular.module("Zen.UltraValidate")
           .factory("UltraValidateContext", [ContextFactory]);

    function ContextFactory()
    {
        return function UltraValidateContext(context, element, ngModel, modelPath, customValidators)
        {
            var self = this;

            // The object which holds the property bound to ngModel
            this.Context = context;
            // The DOM element on which ultra-validate was specified
            this.Element = element;
            // The ngModel controller created for the element
            this.ngModel = ngModel;
            // The string expression that described the path to the property bound to ngModel
            this.ModelPath = modelPath;
            // The name of the property being validated (the property bound to ngModel)
            this.ValidatedProperty = "";
            // The validation rules specified in the context object (i.e. a 'Validations' property)
            this.Rules = {};
            // Any validation object/expression passed to the directive with uv-also
            this.CustomValidators = customValidators;
            // The validation messages property extracted from the 'Validations' property
            this.Messages = [];

            function Initialize()
            {
                // Extract the property name from the model path
                self.ValidatedProperty = self.ModelPath.substring(_.lastIndexOf(modelPath, ".") + 1);
                // Extract any custom validation rules from the model
                self.Rules = self.Context && self.Context.Validations && self.Context.Validations[self.ValidatedProperty];
                // Extract any custom messages specified by the user
                self.Messages = self.Context && self.Context.Validations && self.Context.Validations.Messages;
            }

            // Gets the current value of the bound property
            this.GetValue = () => self.Context[self.ValidatedProperty];
            // Gets the current value of anpther property in the same model (normally will be called to get the value for the other property being watched)
            this.GetOtherValue = (propertyName) => self.Context[propertyName];
            // Gets the specific validation rule specified by the key for the validated property
            this.GetRule = (key) => self.Rules && self.Rules[key];
            
            Initialize();
        }
    };
})(window, angular);