(function(window, angular)
{
    angular.module("Zen.UltraValidate")
        .service("CommonValidators", [CommonValidatorsService]);

    function CommonValidatorsService()
    {
        var defaultPrecision = 2;

        var intOnlyPattern = /^[0-9]+$/;
        var maxPrecision1Pattern = /^[0-9]+(\.[0-9]{1,1})?$/;
        var maxPrecision2Pattern = /^[0-9]+(\.[0-9]{1,2})?$/;
        var maxPrecision3Pattern = /^[0-9]+(\.[0-9]{1,3})?$/;
        var maxPrecision4Pattern = /^[0-9]+(\.[0-9]{1,4})?$/;
        var customMaxPrecisionRegexString = "^[0-9]+(\.[0-9]{1,{{maxPrecision}}})?$";

        this.IntOnly = (value, viewValue) => intOnlyPattern.test(viewValue);
        
        // These are optimized common validators that will instantiate only once
        this.MaxPrecision1 = (value, viewValue) => maxPrecision1Pattern.test(viewValue);
        this.MaxPrecision2 = (value, viewValue) => maxPrecision2Pattern.test(viewValue);
        this.MaxPrecision3 = (value, viewValue) => maxPrecision3Pattern.test(viewValue);
        this.MaxPrecision4 = (value, viewValue) => maxPrecision4Pattern.test(viewValue);

        this.CustomMaxPrecisionValidator = (maxPrecision) =>
        {
            maxPrecision = maxPrecision || defaultPrecision;
            var regexString = customMaxPrecisionRegexString.replace("{{maxPrecision}}", maxPrecision);

            var regex = new RegExp(regexString, "g");

            return (value, viewValue) => regex.test(viewValue);
        };
    }
})(window, angular);