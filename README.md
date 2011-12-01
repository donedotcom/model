A model structure written for Node.js that supports schemas and paths. Written for integration with Backbone.js, and can hook into any document-based database (e.g., MongoDB).

## Features ##
* **Schemas**
  Schemas are declared with the model and comprise a set of fields that are recognized as valid fields in the model. At present, a schema contains only a hash of `field : true|false` mappings, which describe whether the field is allowed in the model or not. Fields not declared in the schema will cause a `Schema error` to be reported when such a field is accessed.

* **Validation**
  Validation is built-in using the NPM module `Validator`. Validation properties can be specified after the model and its schema have been created, using the `validates` function.

* **Paths**
  Throughout the model, "paths" can be used as a convenient way to retrieve and manipulate attributes that are not in the top-level model. For example, if we have a model that describes a user, we may have several sub-models, each of which could also have sub-models, and so on. We can easily point to attributes inside these sub-models using paths. For example, the path `user.public.email` would point to the `email` attribute of the `public` sub-model of the `user` model.

* **Retrieving, Updating, and Removing Attributes**
  Retrieving, updating, and removing attributes is done via the `get`, `set`, and `unset` functions, respectively. Each of these functions supports paths.

* **Errors**
  When using the validation functions, meaningful error messages are returned when trying to create or set a model with a field that does not conform to its validation. These messages are attached to the model's `errors` object, and have full path visibility. For example, to read an error message on the `user.public.email` field, we can call `user.errors.on('public.email')`.

## Development ##
* `npm install` (see `package.json` for list of dependencies)
* To run the tests: `cake spec`
* To check style: `cake hint`

## Todo ##
* Schema types
* Transaction hooks
* Flexible schema models
