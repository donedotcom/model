# Model #

A model based on Done.com's implementation, with extra kickass.

## Spec ##

* **Schemas.**
  * They should declare what's allowed in the model and what it looks like.
  * Models should validate themselves based on the schema.
  * Schemas should be exportable to the browser when possible for client-side validation.
  * Models and their schemas should be nestable.
* **Database Integration.**
  * Although models can be nested, they are never actually nested in the DB. Instead, nested models are saved as the JSON of their `attributes`.
* **Validation.**
  * Models self-validate and return meaningful error messages when errors are found.
* **Paths.**
  * Per `MARKET-40`:
    > `Model` should support `set`, `get` with full pathnames (`a.b.c`), overriding Backbone implementation - `MongoModel` should *not* support set because it's not consistent with MongoDB behavior.
    > `Errors.on()` should support the same syntax.