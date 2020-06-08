# ts_serialize ![](https://github.com/GameBridgeAI/ts_serialize/workflows/ci/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data. ts_serialize can help you with:
- converting camelCase class members to snake_case JSON properties for use with a REST API;
- excluding internal fields from REST API payloads;
- converting data types, for example dates, to an internal format

**Supported Serialize Types**

- [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)

### Installing

**Deno**

Add the URL to your `deps.ts` file and export what you need.

**Node**

TBD

## Usage

### Basic

The main two main `exports` provided are:

1. Serializable - an abstract class that adds the `toJson` and `fromJson` methods
2. SerializeProperty - a [property decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#property-decorators) that defines the properties serialization options

Extend the `Serializable` class and decorate a property with `SerializeProperty` to add it to the serialze map.

```ts
class Test extends Serializable<Test> {
  @SerializeProperty()
  testName = "toJson";
}
assertEquals(new Test().toJson(), `{"testName":"toJson"}`);
const test = new Test().fromJson(`{"testName":"fromJson"}`);
assertEquals(test.testName, "fromJson");
```

**Inheritance**

You can extend `Serializable` from a base class, and make further extensions to your base class; properties
from parent classes are included when serializing and deserializing.

```ts
class Base extends Serializable<Base> {
  id!: number;
}
class Test extends Base<Test> {
  @SerializeProperty()
  testName = "toJson";
}
class Test2 extends Test {
  @SerializeProperty()
  testName2 = "toJson2";
}
assertEquals(typeof new Test2().toJson, "function");
assertEquals(new Test2().toJson(), `{"testName2":"toJson2"}`);
const test = new Test2().fromJson(`{"testName2":"fromJson2"}`);
assertEquals(test.testName2, "fromJson2");
```

**Serialize Property**

The `@SerializeProperty()` decorator indicates the property should be included when serializing and deserializing.
If used with no parameters it uses the property name as-is.

`@SerializeProperty()` can take a `string` as a argument that will be used as the object key when `toJson` is called.

`@SerializeProperty()` can also take a `SerializePropertyOptionsObject`, with optional `serializedName` and `reviveStrategy` properties.

SerializeProperty with a String argument:
```ts
class Test extends Serializable<Test> {
  // Use snake_case when deserializing
  @SerializeProperty("test_name")
  testName = "toJson";
}

assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);

const test = new Test().fromJson({ testName: "fromJson" });
assertEquals(test.testName, "fromJson");
```

SerializeProperty with a SerializePropertyOptionsObject argument:

```ts
const options = {
  /*... markdown options*/
};

class Article extends Serializable<Article> {
  @SerializeProperty({
    serializedName: "user_content",
  })
  userContent = "";
}
assertEqual(
  new Article().fromJson(`{"user_content":"# Title\nContent body.\n"}`)
    .userContent,
  `# Title\nContent body.\n`
);
```

- `SerializedName` (optional) {`string`} - the name used in serialized map
- `reviveStrategy` (optional) {`ReviverList`} - a function or `revive` output

### Advanced

#### Revivers

Revivers are functions used to hydrate your data. For example deserializing dates from
JSON to `Date` is done with a DateReviver used as second parameter in `JSON.stringify`.
Revivers take one parameter which is the current value interated on from `JSON.stringify`.

```ts
function customReviver(value: any) {
  // code
  return value;
}
```

Revivers should always return a value. If the `reviveStrategy` is a `ReviverList` of functions then
they are called in order passing the value to the next reviver. Below is our test breakdown for the `reviveStrategy`.

```ts
test({
  name: "revive composes a reviverList into a reviveStrategy",
  fn() {
    // A reviver that appends a single letter when deserializing
    const addLetter = (letter: string) => (v: string) => `${v}${letter}`;

    // A reviver that appends exclamation marks
    const shout = (v: string) => `${v}!!!`;

    // A list of revivers
    const reviveStrategy = revive(
      addLetter(" "),
      addLetter("W"),
      addLetter("o"),
      addLetter("r"),
      addLetter("l"),
      addLetter("d"),
      shout
    );

    assertEquals(reviveStrategy("Hello"), "Hello World!!!");
  },
});
```

A `reviveStrategy` that is one `reviver` does not require the `revive` function:
```ts
const options = {
  /*...*/
};

// Reviver to deserialize from markdown
const convertFromMarkdown = (mdEngine: MdEngine) => (content: string) =>
  mdEngine.convert(content);

class Article extends Serializable<Article> {
  @SerializeProperty({
    serializedName: "content",

    // A single reviver does not need to be wrapped in revive()
    reviveStrategy: convertFromMarkdown(new MdEngine(options)),
  })
  contentAsHTML = "";
}

assertEqual(
  new Article().fromJson(`{"content":"# Title\nContent body.\n"}`)
    .contentAsHTML,
  `<h1 id="title">Title</h1><p>Content body.</p>`
);
```

## Known Issues

Currently you cannot serialize a `static` member.

## Built With

- [Deno](http://deno.land)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Authors

- **Scott Hardy** - _Initial work_ - [shardyMBAI](https://github.com/shardyMBAI) :frog:
- **Chris Dufour** - _Initial work_ - [@PizzaCatKing](https://github.com/PizzaCatKing) :pizza: :cat: :crown:

See also the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [Parsing Dates with JSON](https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates) for knowledge
- [OAK Server](https://github.com/oakserver/oak) for example code
- [MindBridge](https://mindbridge.ai) for support
