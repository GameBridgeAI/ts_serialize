# Setting up an environment

If you are going to fix an issue or add a feature request please make sure to
point out on the issue that you are doing the work. Please use an issue to make
an request for comments (RFC) before adding a feature without a discussion.

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. `ts_serialize` is built with
`deno`. Follow the
[deno install instructions](https://github.com/denoland/deno_install) to ge it
installed on your machine.

### Installing

Fork and clone the project to your machine and `cd` into that folder. If you are
getting errors about the `deno` namespace you can run

```
$ deno types > deno.d.ts
```

This will add the deno types to the project.

## Running the tests

```
$ deno test
```

You can add a file to test only that one file.

```
$ deno test mod_test.ts
```

### Coding style and tests

We follow the
[Deno style guide](https://deno.land/manual/contributing/style_guide) for code,
including tests. Every file should have a `_test.ts` file testing all exported
symbols.

If you find a bug a test case is the right place to start. Test example:

```ts
test({
  name: "Serialize nested",
  fn() {
    class Test1 extends Serializable {
      @SerializeProperty("serialize_me_1")
      serializeMe = "nice1";
    }
    class Test2 extends Serializable {
      @SerializeProperty({
        serializedKey: "serialize_me_2",
      })
      nested: Test1 = new Test1();
    }
    const testObj = new Test2();

    assertEquals(
      testObj.toJSON(),
      `{"serialize_me_2":{"serialize_me_1":"nice1"}}`,
    );
  },
});
```
