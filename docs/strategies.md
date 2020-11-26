## Strategies

`Strategies` are functions or a composed list of functions to execute on the values when
serializing or deserializing. The functions take one argument which is the value to process.

```ts
const fromJSONStrategy = (v: string): BigInt => BigInt(v);
const toJSONStrategy = (v: BigInt): string => v.toString();

class Test extends Serializable {
  @SerializeProperty({
    serializedKey: "big_int",
    fromJSONStrategy,
    toJSONStrategy,
  })
  bigInt!: BigInt;
}

const testObj = new Test().fromJSON(`{"big_int":"9007199254740991"}`);
assertEquals(testObj.bigInt.toString(), "9007199254740991");
```

### Multiple strategy functions

`toJSONStrategy` and `fromJSONStrategy` can use `composeStrategy` to build out
strategies with multiple functions.

```ts
const addWord = (word: string) => (v: string) => `${v} ${word}`;
const shout = (v: string) => `${v}!!!`;

class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: composeStrategy(addWord("World"), shout),
  })
  property!: string;
}

assertEquals(
  new Test().fromJSON(`{"property":"Hello"}`).property,
  "Hello World!!!"
);
```

### Dates

Dates can use the `fromJSONStrategy` to revive a serialized string into a Date object. `ts_serialize`
provides a `iso8601Date` function to parse ISO Dates.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: iso8601Date,
  })
  date!: Date;
}

const testObj = new Test().fromJSON(`{"date":"2020-06-04T19:01:47.831Z"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2020);
```

`createDateStrategy()` can be use to make a reviving date strategy. 
Pass a regex to make your own.

```ts
class Test extends Serializable {
  @SerializeProperty({
    fromJSONStrategy: createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})$/),
  })
  date!: Date;
}

const testObj = new Test().fromJSON(`{"date":"2099-11-25"}`);
assert(testObj.date instanceof Date);
assertEquals(testObj.date.getFullYear(), 2099);
```

Now that you know about strategies, there is one more trick: [Global transformKey](./transforming)