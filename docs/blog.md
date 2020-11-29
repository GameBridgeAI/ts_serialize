# Serialization and you

What is serialization in computer science? It is the term that describes a method to 
represent data so it an be transferred, stored and accessed my multiple systems or languages.

There are different ways of serialization, for our examples we will talk about 
JavaScript Object Notation (JSON). JSON is an open based file format, it is language-independent, 
and it will represent a key and value pair that is in human readable text.

Javascript (and by nature TypeScript) also have "Objects", these objects have their
own rules for the keys and values. Methods (functions) can be a value for a key, while in
JSON a function cannot be a value. Most importantly: JavaScript and TypeScript objects
are not JSON.

For example let's look at a simple User for an application as a JSON representation and as an object.

Our User will have a first name, last name, and time when it was created.

First a JSON User.

```json
{
    "first_name":  "Theodore",
    "last_name": "Esquire",
    "created_date": "2020-09-24T00:00:00.000Z"
}
```

Now a User as an object (also referred to as "models").

```ts
class User {
    firstName: string = "Theodore";
    lastName: string = "Esquire";
    createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
}
```

Let's go through the differences between the keys and values. In this example both JSON keys and
the object keys are strings, however; the keys themselves are different. An underscore "_" is used
to separate words rather than a capital letter. 

The values from or our dataset also has some differences, in JSON they are all strings, but in the object 
the "createdDate" value is not a string, it is JavaScript "Date" which is made from the string.

Serialization is how we are able to match the different keys together and convert values into their programmable
version. To do that functions can be added to our object, continuing with our example starting with converting JSON to the Object:

```ts
class User {
    firstName: string = "Theodore";
    lastName: string = "Esquire";
    createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
    deserialize(json: string): this {
        this.firstName = json.first_name; // string -> string
        this.lastName = json.last_name; // string -> string
        this.createdDate = new Date(json.created_date); // string -> date
        return this;
    }
}
```
By passing the JSON as our input we can use JavaScript to read it and convert it to what we need.
For our date we create a new Date from the string value. When we set the key on the object we
make sure the "_" is removed and to capitalize the next letter. Serializing we do the same thing but
return a JSON value.

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
    serialize(): JSON {
        return JSON.stringify({
            first_name: this.firstName, // string -> string
            last_name: this.lastName, // string -> string
            created_date: this.createdDate.toJSON() // date -> string
        });
    }
}
```
JSON is a common format and many programming languages have tools to help with conversions, JavaScript 
is no different. "JSON.stringify" helps with making the JSON file format from a object that we can define.
This allows us to convert the keys and the values, our date also has a built in function "toJSON" that helps 
turn the date into a string value to be stored in a JSON format.

## Why is this a problem?

Defining these functions that convert to and from JSON for every model is a lot of work and can lead to
duplicate code, to save on time things can be applied in a global fashion, for example, the key conversions
is often done a different time from serialization. Let's look at an HTTP request to understand

A user signing up will send us data and we'll send data back to the user:

User's Machine -> HTTP request with JSON data -> A server that creates and saves a user -> HTTP response with JSON data -> User's machine (success)

Interceptors are functions that will run right before every HTTP request and right after every HTTP response, 
developers can use these functions to apply the key conversions. There are a few problems with this approach:
1. Serializing the value and keys at different times means there needs to be an underlying knowledge of the interceptor and what it does
2. not all keys should be converted (this conversion is often called the snake_case camelCase conversion)
3. not all keys should be sent to the server and received back from the server
4. although our model does have our functions, it is not a true representation of how a model is (de)serialized

## Introducing ts_serialize@v1.0.0

"ts_serialize" is a program that supports Nodejs, Deno, and browser environments, it is built to deal with all the problems mentioned while keeping serialization simple. It does this by providing a model to "extend". This model adds the functions needed for (de)serialization and provides a decorator to define how properties are (de)serialized. Let's use ts_serialize to redefine out User Model.

```ts
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

"Serializable" will add three methods "toJSON", "fromJSON", and "tsSerialize". 
- fromJSON - takes one argument, the JSON string or Object to deserialize
- toJSON - converts the model to a JSON string with any provided key or value transformations
- tsSerialize - converts the model to "Plain old Javascript object" with any provided key or value transformations

Read more about [Serializable and SerializeProperty](https://gamebridgeai.github.io/ts_serialize/serializable) here.

We an apply the snake_case camelCase conversion globally with an optional function "tsTransformKey".


```ts
class User extends Serializable {
    tsTransformKey(key: string): string {
        return snakeCase(key);
    }

    @SerializeProperty() // string -> string
    firstName: string = "Theodore";

    @SerializeProperty() // string -> string
    lastName: string = "Esquire";

    @SerializeProperty({
        toJSONStrategy: (input) => input.toJSON(), // date -> string
        fromJSONStrategy: (json) => new Date(json), // string -> date
    })
    createdDate: Date = new Date("2020-09-24T00:00:00.000Z");
}
```

We don't ned to convert it back because we track the original property name.

There are man more details in our documentation online https://gamebridgeai.github.io/ts_serialize

Thank you for reading.