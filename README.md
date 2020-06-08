# ts_serialize ![](https://github.com/GameBridgeAI/ts_serialize/workflows/ci/badge.svg) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A zero dependency library for serializing data

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

Extend `Serializable` from a base class

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

**Serialze Property**

The `@SerializeProperty()` decorator adds the property to serialize map. If used with any
parameters it uses the property name as the key in the map. `@SerializeProperty()` can take a
`string` as a argument that will be used as the object key when `toJson` is called. `@SerializeProperty()`
can also take a `SerializePropertyOptionsObject`, with option `serializedName` and `reviveStrategy` properties

String

```ts
class Test extends Serializable<Test> {
  @SerializeProperty("test_name")
  testName = "toJson";
}
assertEquals(new Test().toJson(), `{"test_name":"toJson"}`);
const test = new Test().fromJson({ testName: "fromJson" });
assertEquals(test.testName, "fromJson");
```

SerializePropertyOptionsObject

```ts
const hideEmailSender = (v: string) => `***@${v.split("@")[1]}`;
class Test extends Serializable<Test> {
  @SerializeProperty({ reviveStrategy: hideEmailSender })
  email!: string;
}
const test = new Test().fromJson(`{"email":"test@example.com"}`);
assertEquals(test.email, "***@example.com");
```

- SerializedName (optional) {string} - the name used in serialized map
- reviveStrategy (optional) {ReviverList} - a function or `revive` output

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
they are called in order passinig the value to the next reviver.

```ts
const hideEmailSender = (v: string) => `***@${v.split("@")[1]}`;
const hideDomain = (hideThisDomain: string) => (v: string) => {
  const [sender, domain] = v.split("@");
  const providedDomain = [...domain.split(".")].shift();
  if (providedDomain === hideThisDomain) {
    return `${sender}@***.${domain.split(".").splice(1).join(".")}`;
  }
  return v;
};
class User extends Serializable<User> {
  @SerializeProperty({
    serializedName: "email",
    reviveStrategy: revive(hideEmailSender, hideDomain("example")),
  })
  hiddenEmail = "";
}
assertEqual(
  new User().fromJson(`{"email":"test@example.ca.gov"}`).hiddenEmail,
  "***@***.uk.gov.com"
);
```

A `reviveStrategy` that is one `reviver` does not require `revive`

```ts
const options = {
  /*...*/
};
const convertFromMarkdown = (mdEngine: MdEngine) => (content: string) =>
  mdEngine.convert(content);
class Article extends Serializable<Article> {
  @SerializeProperty({
    serializedName: "content",
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

Revive Stragey test berakdown

```ts
const addLetter = (letter: string) => (v: string) => `${v}${letter}`;
const shout = (v: string) => `${v}!!!`;
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
