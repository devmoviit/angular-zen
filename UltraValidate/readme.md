# Zen tools **ultra-validate**

1. [The directive](#directive)
2. [Dependencies](#dependencies)
3. [How to use](#usage)
4. [Validation keys](#validationKeys)
5. [Localization](#localization)
6. [Validation callbacks](#callbacks)
7. [Validation configuration](#validationConfig)
8. [Validation handling](#handling)
9. [Internals - How does it work?](#internals)

<a name="directive"></a>
### **ultra-validate** - The directive

`ultra-validate` is magic! arming you with full control over validations with zero effort!<br/>
`ultra-validate` comes to automate native and custom validations using angular.<br/>
Simply assign it to an input element assigned with `ng-model`, and `ultra-validate` will do the rest!<br/>

`ultra-validate` automatically shows localized error messages and a cool small badge with the number of errors.
Validations are fully customizable and validation handling can be fully customized (See [Validation Handling](#handling)).

##### Disclaimer
`ultra-validate` was initially created as part of a project I am working on.
Dispite of time limits I decided to share it with the community and took the effort of documenting it in this readme.md file.
Therefore, docs might be incomplete, it does not have unit testing, and it is given as-is.
I will do my best to follow issues and improve the directive and help with questions.
You are free to use `Zen tools` and `ultra-validate` in anyway you want.

Let the magic begin! :)

<a name="dependencies"></a>
### Dependencies

* angular 1.5.x
* lodash
* angular-translate (optional)
* ui-bootstrap (optional)

<a name="usage"></a>
### How to use

##### Basic use
1. Include `Zen` tools as a dependency:

```javascript
angular.module("yourApp", ["Zen"]);
```

2. Assign your input with `ultra-validate`:

```html
<input type="text" ng-model="theObject.TheProperty" ultra-validate min="..." pattern="..." />
```

3. Create translation messages under a root 'validations' key containing validation names as keys:
```json
validations: {
    required: "The field is required",
    ...
}
```

When invalid, a small red badge will appear on the top-right of the input element with the error count.
Hovering on the badge will display a tooltip with the accumulated error message.


##### Custom validations

4. Add a 'Validations' object property to your model, specifying property names as keys (case sensative) and validation configuration as values.

```javascript
this.Validations = {
    Name: <validation config>
}
```
<br/>

Validation configuration can take one of the following shapes per property:

<a name="valString"></a>
1. A string containing an expression accessible through $scope to evaluate.
```javascript
this.Validations = {
    Name: "IsCoolName()",
    Age: "user.Age > 18"
}
```

<a name="valFunction"></a>
2. A function to evaluate:
```javascript
this.Validations = {
    Name: (value, viewValue, context) => value !== "playboy"
}
```

<a name="valConfig"></a>
3. A validations configuration object (see [validation configuration](#validationConfig)):
```javascript
this.Validations = {
    Name: {
        validateIf: (value, viewValue, context) => value.length > 3,
        validate: (value, viewValue, context) => value.indexOf("zen") > -1
    },
    Age: (value, viewValue, context) => value > 18
}
```

<a name="valArray"></a>
4. An array with injectable expressions and a validation function:
```javascript
this.Validations = {
    Name: ["specialNames", (value, viewValue, context, specialNames) => { ... }]
}
```
The first elements of the array are evaluateable expressions to evaluate and inject to the validation function at the moment of validation.
The last element is the validation function itself, were the last arguments are the evaluation result of the injected expressions.


5. A multi-validation configuration object, where keys are validation names and values are either [#1](#valString), [#2](#valFunction), [#3](#valConfig), or [#4](#valArray):

```javascript
this.Validations = {
    Name: {
        isCoolName: (value) => value.indexOf("zenTools") > -1,
        isGreat: {
            validateIf: (value, viewValue, context) => value.length > 3,
            validate: (value, viewValue, context) => value.indexOf("zen") > -1
    },
    Age: {
        isAdult: (value, viewValue, context) => value > 23,
        isNotDying: (value) => value < 90
    }        
}
```
<br/>

<a name="validationKeys"></a>
**Note:**<br/>
When specifying validation names:
1. Validation errors will take the name (key) specified in the `Validations` object under the property name.
2. Translations will be refered to by the validation name (key).
3. All validations under the property must pass to set the property as valid.

When not specifying validation names the key will be 'ultraValidate'.

Any additional custom validations can be specified using the `uv-also` attribute which takes values of the above forms.
If `uv-also` specifies a direct function call or any expression that directly evaluates to a value, the contents of `uv-also` must be wrapped in single-quote.

Example: `uv-also="'stock.HasProduct(product)'"`

<a name="localization"></a>
#### Localization

By default, `ultra-validate` uses the `DefaultValidationHandler` to react to validation procedures, which uses the great [angular-translate](https://angular-translate.github.io/)
to show localized error messages.

In your `Validations` objects, create a property named `Messages`, and specify the parent translation id for the model's error messages.

In your translation file, under the parent object, specify the validated property name (case sensitive) with validation names under the property.
[Key naming rules](#validationKeys) apply.

```json
{
    User: {
        Name: {
            isCoolName: "This name is not cool",
            isGreat: "The name should be great"
        },
        Age:
            isAdult: "You must be an adult",
            isNotDying: "You cannot be dying"
    }
}
```
See [Validation Handling](#handling) to change this behaviour.

`ultra-validate` always provides the `$translate` servies with 4 values:

1. `value` - The value that failed validation.
2. `name` - The name of the property that failed validation.
3. `otherValue` - The value of the other watched property in the time the current property failed validation (in case [`watch` specifies a string](#validationConfig))
4. `otherName` - The name of the other watched property in the time the current property failed validation.

<a name="callbacks"></a>
#### Validation Callbacks

When a validation check is fired, the validation function received 3 params:
1. `value` - The new model value (e.g. 23)
2. `viewValue` - The new view value (e.g. "23")
3. `context` - An object containing information about the current validation process. You can use this object to do extra validations or access other properties easily. See [UltraValidateContextFactory.js](Core/UltraValidateContextFactory.js) for API.

<a name="validationConfig"></a>
#### Validation Configuration

In addition to a validation expression/function the property can be assigned with advanced validation configuration by specifying an object with one or more of the following properties:
1. `validate` *[function|string]* - The actual expression/function to validate the proprty

2. `validateIf` *[function|string]* - (Optional) An expression/function to evaluate just before the actual validation and decide if validation should be performed.<br/>
                returning `true` will go through with the validation;<br/>returning `false` will signal that the value is valid and validation will not be performed.

3. `isAsync` *[boolean]* - (Optional) `ultra-validate` supports async validations using promises. If your `validate` property would end up returning a promise, set this to `true`

4. `watch` *[function|string]* - (Optional) An expression or a function to watch and evaluate in addition to the current property. Any changes to the watched value will trigger the validation.
  As a string, `watch` can take one of the following forms:<br/>
  **A simple string** - Will be treated as a name of another property to watch automatically in the current context.<br/>
  **An interpolation string (e.g. `{{someExpression}}`)** - Will be treated as a scope accessible expression to watch.

5. `collectionWatch` *[boolean]* - (Optional) `true` to use angular's `$watch()` function.<br/>
                                `false` to use angular's `$watchCollection()` function.<br/>
                                `undefined` will make the function evaluate the expression once and decide what function to use according to the value type.<br/>
                                Arrays and objects are automatically watched using `$watchCollection()`. Anything else will be watched using `$watch()`.

6. `deepWatch` *[boolean]* - (Optional) `true` to apply a deep watch; otherwise `false` (Default is `false`).<br/>
                           Only applies to watches using the `$watch()` function.

7. `dirtyOnly` *[boolean]* - (Optional) `true` to run the validation procedure only if the input is dirty; otherwise `false` (Default is `true`).

8. `validateNull` *[boolean]* - (Optional) `true` to run the validation procedure on `null` values; otherwise `false` (Default is `false`).

<a name="handling"></a>
#### Validation Handling

By default, `ultra-validate` shows or hides a small red badge on the top-right corner of the input element.
Hovering on the badge will show a tooltip with localized error messages.

To do that, the directive uses [angular-translate](https://angular-translate.github.io/) and [ui-bootstrap](https://angular-ui.github.io/bootstrap/).

Changing this behaviour is easy...<br/>
Simply write your own `ValidationHandler` service and use the `ValidationHandlerProvider` to set `ultra-validate`'s to react using your new service.

```javascript

angular.module("yourApp", ["Zen"])
       .config("ValidationHandlerProvider", [ValidationHandlerProvider, ValidationHandlerConfig]);

function ValidationHandlerConfig(ValidationHandlerProvider)
{
    ValidationHandlerProvider.set("MyNewValidationHandler");
}
```

See [DefaultValidationHandlerService.js](ValidationHandling/DefaultValidationHandlerService.js) for API implementation details.

<a name="internals"></a>
#### Internals - How does it work?

When initialized, the directive looks up the `ngModel` controller.
... TODO