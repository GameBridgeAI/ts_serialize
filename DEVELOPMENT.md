# Setting up an environment

If you are going to fix an issue or add a feature request please make sure to
point out on the issue that you are doing the work. Please use an issue to make
an request for comments (RFC) before adding a feature without a discussion.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. `ts_serialize` is built with `deno`. Follow the [deno install instructions](https://github.com/denoland/deno_install) to ge it installed on your machine.

### Installing

Fork the project to your machine and `cd` into that folder. If you are getting errors about the
`deno` namespace you can run

```
$ deno test > deno.d.ts
```

This will add the deno types to the project.

## Running the tests

```bash
$ deno test -c tsconfig.json
```

You can add a file to test only that one file.

```bash
$ deno test -c tsconfig.json mod_test.ts
```

### Coding style and tests

We follow the [Deno style guide](https://deno.land/manual/contributing/style_guide)
for code, including tests. Every file should have a `_test.ts` file testing all exported symbols.

If you find a bug a test case is the right place to start. Below we test that we will revive
and array with the provided `type`

```ts
test({
  name: "Revives an array of `type`",
  fn() {
    class OtherClass extends Serializable<OtherClass> {
      @SerializeProperty()
      id!: number;
    }
    class Test extends Serializable<Test> {
      @SerializeProperty({
        reviveStrategy: (v: OtherClass) => new OtherClass().fromJson(v),
      })
      array!: OtherClass[];
    }
    const test = new Test().fromJson(
      `{"array":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}`
    );
    assertEquals(test.array.length, 5);
    assert(test.array[0] instanceof OtherClass);
    assertEquals(test.array[4].id, 5);
  },
});
```
