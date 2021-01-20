# Serialization and you

_Serialization_ is the term that describes a method to represent data so it an
be transferred, stored and accessed by multiple systems or languages.

There are many serialization formats; for our examples we will talk about
JavaScript Object Notation (JSON). JSON is standard, language-independent file
format that represends objects as key and value pairs in human readable text.

JavaScript (and by extension TypeScript) also have "Objects"; these objects have
their own rules for the keys and values. Methods (functions) can be a value for
a key, while in JSON a function cannot be a value. Most importantly: JavaScript
and TypeScript objects are not JSON.

For example let's look at a simple User record for an application as a JSON
representation and as an object.

Our User will have a first name, last name, and time when it was created.

First, a JSON User document:

```json
{
    "first_name":  "Theodore",
    "last_name": "Esquire",
    "created_date": "2020-09-24T00:00:00.000Z"
}
```

When a JavaScript class is used to represent a record being sent between systems
or layers, it's referred to as a model class. Here is User as a TypeScript model
class, with default values for illustration:

```ts
class User {
  firstName: string = "Theodore";
  lastName: string = "Esquire";
  createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
}
```

Let's go through the differences between the keys and values. In this example
both JSON keys and the object keys are strings; however, the keys themselves are
different. In the JSON example the underscore `_` is used to separate words
rather than a capital letter. This use of `snake_case` is a choice made by the
API designer; in JavaScript and TypeScript classes it's more traditional to use
`camelCase` instead, and linter frameworks will often warn if you use
`snake_case` variable names in JavaaScript. Mapping between API conventions and
JavaScript conventions is a key problem when working with JSON data.

The values from or our dataset also have some differences: in JSON they are all
strings, but in TypeScript the `createdDate` value is not a string, it is a
JavaScript `Date`.

Serialization is how we're able to match the different keys together and convert
values into their programmable version. We can do this manually for each model
class by adding custom functions:

```ts
class User {
  firstName: string;
  lastName: string;
  createdDate: Date;

  deserialize(json: string): this {
    this.firstName = json.first_name; // string -> string
    this.lastName = json.last_name; // string -> string
    this.createdDate = new Date(json.created_date); // string -> date
    return this;
  }
}

// ...
const user = new User().deserialize(JSON.parse(`{
    "first_name": "Theodore",
    "last_name": "Esquire",
    "created_date": "2020-09-24T00:00:00.000Z"
}`));
```

By passing the JSON as our input we can use JavaScript to read it and convert it
to what we need. For our date we create a new Date from the string value. To
serialize we do the same thing but return a JSON value.

```ts
class User {
  firstName: string = "Theodore";
  lastName: string = "Esquire";
  createdDate: Date = new Date("2020-09-24T00:00:00.000Z");

  deserialize(json: string): this {
    this.firstName = json.first_name; // string -> string
    this.lastName = json.last_name; // string -> string
    this.createdDate = new Date(json.created_date); // string -> Date
    return this;
  }

  serialize(): string {
    return JSON.stringify({
      first_name: this.firstName, // string -> string
      last_name: this.lastName, // string -> string
      created_date: this.createdDate.toJSON(), // date -> string
    });
  }
}
```

JSON is a common format and many programming languages have tools to help with
conversions; JavaScript is no different. `JSON.stringify()` helps with making
the JSON file format from a object that we can define. This allows us to convert
the keys and the values. The `Date` class also has a built-in function "toJSON"
that helps turn the date into a string value to be stored in a JSON format.

## Why is this a problem?

Defining these functions that convert to and from JSON for every model is a lot
of work and can lead to duplicate code. To save on time things can be applied in
a global fashion. For example, the key conversions (`snake_case` to `camelCase`)
are often done a different time from serialization. Let's look at an HTTP
request to understand. A user signing up will send us data and we'll send data
back to the user:

User's Machine -> HTTP request with JSON data -> A server that creates and saves
a user -> HTTP response with JSON data -> User's machine (success)

A web app will use a library like Axios or Angular's HttpClient to make requests
to the server. These libraries have the concept of an interceptor: a function
that will run right before every HTTP request or right after every HTTP
response. Developers can write these functions to apply the key conversions.
There are a few problems with this approach:

1. Serializing the value and keys at different times means there needs to be an
   underlying knowledge of the interceptor and what it does.
2. Not all keys should be converted. For example, the server may send a
   configuration map with uppercase Java enum-style keys, `LIKE_THIS`.
   Converting those keys to camelCase `LIKETHIS` will lead to mismatches when
   saving them back to the server.
3. Not all keys are meant to be sent over the wire.
4. Interceptors need special logic to avoid modifying other, non-JSON content
   types, such as `multipart/form-data`.

## Introducing ts_serialize@v1.0.0

`ts_serialize` is a program that supports Node.js, Deno, and browser
environments. It is built to deal with all the problems mentioned while keeping
serialization simple. It does this by providing a base class that model classes
can extend. The base class adds the functions needed for (de)serialization and
provides a decorator to define how properties are (de)serialized. Let's use
ts_serialize to redefine our User Model.

```ts
import { Serializable, SerializeProperty } from "@gamebridgeai/ts_serialize";

class User extends Serializable {
  @SerializeProperty("first_name") // string -> string
  firstName: string = "Theodore";

  @SerializeProperty("last_name") // string -> string
  lastName: string = "Esquire";

  @SerializeProperty({
    serializedKey: "created_date",
    toJSONStrategy: (input) => input.toJSON(), // date -> string
    fromJSONStrategy: (json) => new Date(json), // string -> date
  })
  createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
}
```

Model properties without "@SerializeProperty()" do not get serialized.

Extending `Serializable` will add three methods: `toJSON()`, `fromJSON()`, and
`tsSerialize()`.

- fromJSON - takes one argument, the JSON string or Object to deserialize
- toJSON - converts the model to a JSON string with any provided key or value
  transformations
- tsSerialize - converts the model to "Plain old Javascript object" with any
  provided key or value transformations

We can save some typing and apply the `snake_case/camelCase` conversion to all
properties in the class. Define an optional method `tsTransformKey()` that uses
a snake-case conversion function, like lodash's
[`snakeCase()`](https://lodash.com/docs#snakeCase):

```ts
import {
  iso8601Date,
  Serializable,
  SerializeProperty,
} from "@gamebridgeai/ts_serialize";
import snakeCase from "lodash.snakeCase";

/** Base class with common snake_case configuration for this app */
abstract class BaseModel extends Serializable {
  tsTransformKey(key: string): string {
    return snakeCase(key);
  }
}

/** User record */
class User extends BaseModel {
  @SerializeProperty() // string -> string
  firstName: string = "Theodore";

  @SerializeProperty() // string -> string
  lastName: string = "Esquire";

  @SerializeProperty({
    fromJSONStrategy: iso8601Date, // string -> date
  })
  createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
}
```

ts_serialize keeps track of the original and serialized property names, so we
don't need to configure anything to do the reverse transformation.

The example also uses the `iso8601Date` utility function to deserializing
timestamps in standard ISO-8601 formats.

There are more details in our documentation at
https://gamebridgeai.github.io/ts_serialize. The library is provided under the
MIT license on GitHub at https://github.com/GameBridgeAI/ts_serialize and is
available in the `npm` and `deno` package registries.

Thank you for reading.
