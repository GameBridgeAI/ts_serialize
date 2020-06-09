// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

// @ts-nocheck
/* eslint-disable */
let System, __instantiateAsync, __instantiate;

(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };

  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }

  __instantiateAsync = async (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExpA(m);
  };

  __instantiate = (m) => {
    System = __instantiateAsync = __instantiate = undefined;
    rF(m);
    return gExp(m);
  };
})();

// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "serialize_property_options_map",
  [],
  function (exports_1, context_1) {
    "use strict";
    var ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY,
      ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY,
      SerializePropertyOptionsMap;
    var __moduleName = context_1 && context_1.id;
    return {
      setters: [],
      execute: function () {
        exports_1(
          "ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY",
          ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY =
            "This key name is already in use by another property, please use a different name",
        );
        exports_1(
          "ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY",
          ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY =
            "This serialize key is already in use by another property, please use a different name",
        );
        /** Double indexed map of Serialized Property Options
             * The property options of a Serialize Property can be looked up by both the
             * property key on the original object, and the serialized property key used
             * in json
             *
             * When adding a key to the map that overlaps the property key or the serialize
             * key of a parent key any parent entries using those keys will be ignored, even
             * if no entry for the child map exists
             */
        SerializePropertyOptionsMap = class SerializePropertyOptionsMap {
          constructor(parentMap) {
            this.parentMap = parentMap;
            this.propertyKeyMap = new Map();
            this.serializedKeyMap = new Map();
            // Set of serialized keys to ignore. This is to hide serialized keys on the parent
            // when a different property key is overridden for the same serialized key
            this.propertyKeyIgnoreSet = new Set();
            this.serializedKeyIgnoreSet = new Set();
          }
          /** Setting a key will throw an error if there are key collisions with either
                 * an existing property key or serialized key
                 */
          set(serializePropertyOptions) {
            if (
              this.serializedKeyMap.has(serializePropertyOptions.serializedKey)
            ) {
              throw new Error(
                `${ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY}: ${serializePropertyOptions.serializedKey}`,
              );
            }
            if (this.propertyKeyMap.has(serializePropertyOptions.propertyKey)) {
              throw new Error(
                `${ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY}: ${serializePropertyOptions.propertyKey.toString()}`,
              );
            }
            this.propertyKeyIgnoreSet.delete(
              serializePropertyOptions.propertyKey,
            );
            this.propertyKeyMap.set(
              serializePropertyOptions.propertyKey,
              serializePropertyOptions,
            );
            this.serializedKeyIgnoreSet.delete(
              serializePropertyOptions.serializedKey,
            );
            this.serializedKeyMap.set(
              serializePropertyOptions.serializedKey,
              serializePropertyOptions,
            );
            // Hide parent property key mappings for previous value of serialized key
            const parentSerializedObject = this.parentMap?.getBySerializedKey(
              serializePropertyOptions.serializedKey,
            );
            if (
              parentSerializedObject &&
              parentSerializedObject.propertyKey !==
                serializePropertyOptions.propertyKey
            ) {
              this.propertyKeyIgnoreSet.add(parentSerializedObject.propertyKey);
            }
            // Hide parent serializedKey mapping for previous value of property key
            const parentPropertyObject = this.parentMap?.getByPropertyKey(
              serializePropertyOptions.propertyKey,
            );
            if (
              parentPropertyObject &&
              parentPropertyObject.serializedKey !==
                serializePropertyOptions.serializedKey
            ) {
              this.serializedKeyIgnoreSet.add(
                parentPropertyObject.serializedKey,
              );
            }
          }
          hasPropertyKey(propertyKey) {
            return (this.propertyKeyMap.has(propertyKey) ||
              (!this.propertyKeyIgnoreSet.has(propertyKey) &&
                this.parentMap?.hasPropertyKey(propertyKey)) ||
              false);
          }
          getByPropertyKey(propertyKey) {
            return (this.propertyKeyMap.get(propertyKey) ||
              (!this.propertyKeyIgnoreSet.has(propertyKey) &&
                this.parentMap?.getByPropertyKey(propertyKey)) ||
              undefined);
          }
          hasSerializedKey(serializedKey) {
            return (this.serializedKeyMap.has(serializedKey) ||
              (!this.serializedKeyIgnoreSet.has(serializedKey) &&
                this.parentMap?.hasSerializedKey(serializedKey)) ||
              false);
          }
          getBySerializedKey(serializedKey) {
            return (this.serializedKeyMap.get(serializedKey) ||
              (!this.serializedKeyIgnoreSet.has(serializedKey) &&
                this.parentMap?.getBySerializedKey(serializedKey)) ||
              undefined);
          }
          /** Get a map of all property entries for this map,
                 * including parent entires, excluding any ignored parent properties
                 */
          getMergedWithParentMap() {
            let parentEntries = Array.from(
              this.parentMap?.getMergedWithParentMap() || [],
            );
            return new Map([
              ...parentEntries.filter((e) =>
                !this.propertyKeyIgnoreSet.has(e[0])
              ),
              ...this.propertyKeyMap,
            ]);
          }
          propertyOptions() {
            return this.getMergedWithParentMap().values();
          }
        };
        exports_1("SerializePropertyOptionsMap", SerializePropertyOptionsMap);
      },
    };
  },
);
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register("to_json/default_to_json", [], function (exports_2, context_2) {
  "use strict";
  var __moduleName = context_2 && context_2.id;
  /** Use the default replacer logic
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
    */
  function defaultToJson(value) {
    return value;
  }
  exports_2("defaultToJson", defaultToJson);
  return {
    setters: [],
    execute: function () {
    },
  };
});
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "to_json/recursive_to_json",
  ["serializable"],
  function (exports_3, context_3) {
    "use strict";
    var serializable_ts_1;
    var __moduleName = context_3 && context_3.id;
    /** Recursively serialize a serializable class */
    function recursiveToJson(value) {
      return serializable_ts_1.toPojo(value);
    }
    exports_3("recursiveToJson", recursiveToJson);
    return {
      setters: [
        function (serializable_ts_1_1) {
          serializable_ts_1 = serializable_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "serializable",
  ["to_json/default_to_json", "to_json/recursive_to_json"],
  function (exports_4, context_4) {
    "use strict";
    var default_to_json_ts_1,
      recursive_to_json_ts_1,
      SerializePropertyOptions,
      SERIALIZABLE_CLASS_MAP,
      ERROR_MESSAGE_MISSING_PROPERTIES_MAP,
      Serializable;
    var __moduleName = context_4 && context_4.id;
    /** Function to build a `fromJsonStrategy`
     * Converts value from functions provided as parameters
     */
    function composeFromJsonStrategy(...fns) {
      return (val) => fns.flat().reduce((acc, f) => f(acc), val);
    }
    exports_4("composeFromJsonStrategy", composeFromJsonStrategy);
    /** Function to build a `toJsonStrategy`
     * Converts value from functions provided as parameters
     */
    function composeToJsonStrategy(...fns) {
      return (val) => fns.flat().reduce((acc, f) => f(acc), val);
    }
    exports_4("composeToJsonStrategy", composeToJsonStrategy);
    /** Converts to object using mapped keys */
    function toPojo(context) {
      const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
        context?.constructor?.prototype,
      );
      if (!serializablePropertyMap) {
        throw new Error(
          `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
            ?.prototype}`,
        );
      }
      const record = {};
      for (
        let { propertyKey, serializedKey, toJsonStrategy }
          of serializablePropertyMap.propertyOptions()
      ) {
        // Assume that key is always a string, a check is done earlier in SerializeProperty
        const value = context[propertyKey];
        // If no replacer strategy was provided then default
        if (!toJsonStrategy) {
          if (SERIALIZABLE_CLASS_MAP.get(value?.constructor?.prototype)) {
            // If the value is serializable then use the recursive replacer
            toJsonStrategy = recursive_to_json_ts_1.recursiveToJson;
          } else {
            toJsonStrategy = default_to_json_ts_1.defaultToJson;
          }
        }
        // Array handling
        if (Array.isArray(value)) {
          const arrayToJsonStrategy = toJsonStrategy;
          record[serializedKey] = value.map((v) => arrayToJsonStrategy(v));
        } // Object and value handling
        else if (value !== undefined) {
          record[serializedKey] = toJsonStrategy(value);
        }
      }
      return record;
    }
    exports_4("toPojo", toPojo);
    /** Convert to `pojo` with our mapping logic then to string */
    function toJson(context) {
      return JSON.stringify(toPojo(context));
    }
    function fromJson(context, json) {
      const serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(
        context?.constructor?.prototype,
      );
      if (!serializablePropertyMap) {
        throw new Error(
          `${ERROR_MESSAGE_MISSING_PROPERTIES_MAP}: ${context?.constructor
            ?.prototype}`,
        );
      }
      const _json = typeof json === "string" ? json : JSON.stringify(json);
      return Object.assign(
        context,
        JSON.parse(
          _json,
          /** Processes the value through the provided or default `reviveStrategy`
         * @default reviveStrategy - no-op reviver strategy
         */
          function revive(key, value) {
            // After last iteration the reviver function will be called one more time with a empty string key
            if (key === "") {
              return value;
            }
            const {
              propertyKey,
              fromJsonStrategy = (v) => v,
            } = serializablePropertyMap.getBySerializedKey(key) || {};
            const processedValue = Array.isArray(value)
              ? value.map((v) => fromJsonStrategy(v))
              : fromJsonStrategy(value);
            if (propertyKey) {
              context[propertyKey] = processedValue;
              return;
            }
            return processedValue;
          },
        ),
      );
    }
    return {
      setters: [
        function (default_to_json_ts_1_1) {
          default_to_json_ts_1 = default_to_json_ts_1_1;
        },
        function (recursive_to_json_ts_1_1) {
          recursive_to_json_ts_1 = recursive_to_json_ts_1_1;
        },
      ],
      execute: function () {
        /** options to use when (de)serializing values */
        SerializePropertyOptions = class SerializePropertyOptions {
          constructor(
            propertyKey,
            serializedKey,
            fromJsonStrategy,
            toJsonStrategy,
          ) {
            this.propertyKey = propertyKey;
            this.serializedKey = serializedKey;
            if (Array.isArray(fromJsonStrategy)) {
              this.fromJsonStrategy = composeFromJsonStrategy(
                ...fromJsonStrategy,
              );
            } else if (fromJsonStrategy) {
              this.fromJsonStrategy = fromJsonStrategy;
            }
            if (Array.isArray(toJsonStrategy)) {
              this.toJsonStrategy = composeToJsonStrategy(...toJsonStrategy);
            } else if (toJsonStrategy) {
              this.toJsonStrategy = toJsonStrategy;
            }
          }
        };
        exports_4("SerializePropertyOptions", SerializePropertyOptions);
        /** Class options map */
        exports_4("SERIALIZABLE_CLASS_MAP", SERIALIZABLE_CLASS_MAP = new Map());
        ERROR_MESSAGE_MISSING_PROPERTIES_MAP =
          "Unable to load serializer properties for the given context";
        /** Adds methods for serialization */
        Serializable = class Serializable {
          toJson() {
            return toJson(this);
          }
          fromJson(json = {}) {
            return fromJson(this, json);
          }
        };
        exports_4("Serializable", Serializable);
      },
    };
  },
);
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "serialize_property",
  ["serializable", "serialize_property_options_map"],
  function (exports_5, context_5) {
    "use strict";
    var serializable_ts_2,
      serialize_property_options_map_ts_1,
      ERROR_MESSAGE_SYMBOL_PROPERTY_NAME;
    var __moduleName = context_5 && context_5.id;
    /** Property wrapper that adds serializable options to the class map */
    function SerializeProperty(decoratorArguments = {}) {
      return (target, propertyName) => {
        let decoratorArgumentOptions;
        // String argument
        if (typeof decoratorArguments === "string") {
          decoratorArgumentOptions = { serializedKey: decoratorArguments };
        } // Object arguments
        else {
          // We can't use symbols as keys when serializing
          // a serializedName must be provided if the property isn't a string
          if (
            !decoratorArguments.serializedKey &&
            typeof propertyName === "symbol"
          ) {
            throw new Error(ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
          }
          decoratorArgumentOptions = {
            serializedKey: propertyName,
            ...decoratorArguments,
          };
        }
        let serializablePropertiesMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP
          .get(target);
        // Initialize the map for this class
        if (!serializablePropertiesMap) {
          // If the parent has a serialization map then inherit it
          const parentMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP.get(
            Object.getPrototypeOf(target),
          );
          serializable_ts_2.SERIALIZABLE_CLASS_MAP.set(
            target,
            new serialize_property_options_map_ts_1.SerializePropertyOptionsMap(
              parentMap,
            ),
          );
          serializablePropertiesMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP
            .get(target);
        }
        serializablePropertiesMap.set(
          new serializable_ts_2.SerializePropertyOptions(
            propertyName,
            decoratorArgumentOptions.serializedKey,
            decoratorArgumentOptions.fromJsonStrategy,
            decoratorArgumentOptions.toJsonStrategy,
          ),
        );
      };
    }
    exports_5("SerializeProperty", SerializeProperty);
    return {
      setters: [
        function (serializable_ts_2_1) {
          serializable_ts_2 = serializable_ts_2_1;
        },
        function (serialize_property_options_map_ts_1_1) {
          serialize_property_options_map_ts_1 =
            serialize_property_options_map_ts_1_1;
        },
      ],
      execute: function () {
        exports_5(
          "ERROR_MESSAGE_SYMBOL_PROPERTY_NAME",
          ERROR_MESSAGE_SYMBOL_PROPERTY_NAME =
            "The key name cannot be inferred from a symbol. A value for serializedName must be provided",
        );
      },
    };
  },
);
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "from_json/date_from_json",
  [],
  function (exports_6, context_6) {
    "use strict";
    var ISODateFromJson;
    var __moduleName = context_6 && context_6.id;
    /** allows authors to pass a regex to parse as a date */
    function createDateStrategy(regex) {
      return (value) => {
        return typeof value === "string" && regex.exec(value) ? new Date(value)
        : value;
      };
    }
    exports_6("createDateStrategy", createDateStrategy);
    return {
      setters: [],
      execute: function () {
        /** Changed from
             * @see https://weblog.west-wind.com/posts/2014/Jan/06/JavaScript-JSON-Date-Parsing-and-real-Dates
             */
        exports_6(
          "ISODateFromJson",
          ISODateFromJson = createDateStrategy(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/,
          ),
        );
      },
    };
  },
);
// Copyright 2018-2020 Gamebridge.ai authors. All rights reserved. MIT license.
System.register(
  "mod",
  [
    "serialize_property",
    "serializable",
    "from_json/date_from_json",
    "to_json/default_to_json",
    "to_json/recursive_to_json",
  ],
  function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (serialize_property_ts_1_1) {
          exports_7({
            "SerializeProperty": serialize_property_ts_1_1["SerializeProperty"],
          });
        },
        function (serializable_ts_3_1) {
          exports_7({
            "Serializable": serializable_ts_3_1["Serializable"],
            "fromJsonStrategy": serializable_ts_3_1["composeFromJsonStrategy"],
            "toJsonStrategy": serializable_ts_3_1["composeToJsonStrategy"],
          });
        },
        function (date_from_json_ts_1_1) {
          exports_7({
            "createDateStrategy": date_from_json_ts_1_1["createDateStrategy"],
            "ISODateFromJson": date_from_json_ts_1_1["ISODateFromJson"],
          });
        },
        function (default_to_json_ts_2_1) {
          exports_7({
            "defaultToJson": default_to_json_ts_2_1["defaultToJson"],
          });
        },
        function (recursive_to_json_ts_2_1) {
          exports_7({
            "recursiveToJson": recursive_to_json_ts_2_1["recursiveToJson"],
          });
        },
      ],
      execute: function () {
      },
    };
  },
);

const __exp = __instantiate("mod");
export const SerializeProperty = __exp["SerializeProperty"];
export const Serializable = __exp["Serializable"];
export const FromJsonStrategy = __exp["FromJsonStrategy"];
export const ToJsonStrategy = __exp["ToJsonStrategy"];
export const fromJsonStrategy = __exp["fromJsonStrategy"];
export const toJsonStrategy = __exp["toJsonStrategy"];
export const createDateStrategy = __exp["createDateStrategy"];
export const ISODateFromJson = __exp["ISODateFromJson"];
export const defaultToJson = __exp["defaultToJson"];
export const recursiveToJson = __exp["recursiveToJson"];
