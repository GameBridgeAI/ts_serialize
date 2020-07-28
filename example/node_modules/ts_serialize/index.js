// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
// This is a specialised implementation of a System module loader.
"use strict"; // @ts-nocheck

/* eslint-disable */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursiveToJson = exports.defaultToJson = exports.fromJsonAs = exports.ISODateFromJson = exports.createDateStrategy = exports.composeStrategy = exports.ToJsonStrategy = exports.FromJsonStrategy = exports.Serializable = exports.SerializeProperty = void 0;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var System, _instantiate;

(function () {
  var r = new Map();
  System = {
    register: function register(id, d, f) {
      r.set(id, {
        d: d,
        f: f,
        exp: {}
      });
    }
  };

  function dI(_x, _x2) {
    return _dI.apply(this, arguments);
  }

  function _dI() {
    _dI = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(mid, src) {
      var id, _id$split$reverse, _id$split$reverse2, o, ia, _src$split$reverse, _src$split$reverse2, sa, oa, s, i;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              id = mid.replace(/\.\w+$/i, "");

              if (!id.includes("./")) {
                _context.next = 18;
                break;
              }

              _id$split$reverse = id.split("/").reverse(), _id$split$reverse2 = _toArray(_id$split$reverse), o = _id$split$reverse2[0], ia = _id$split$reverse2.slice(1), _src$split$reverse = src.split("/").reverse(), _src$split$reverse2 = _toArray(_src$split$reverse), sa = _src$split$reverse2.slice(1), oa = [o];
              s = 0;

            case 4:
              if (!(i = ia.shift())) {
                _context.next = 16;
                break;
              }

              if (!(i === "..")) {
                _context.next = 9;
                break;
              }

              s++;
              _context.next = 14;
              break;

            case 9:
              if (!(i === ".")) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("break", 16);

            case 13:
              oa.push(i);

            case 14:
              _context.next = 4;
              break;

            case 16:
              if (s < sa.length) oa.push.apply(oa, _toConsumableArray(sa.slice(s)));
              id = oa.reverse().join("/");

            case 18:
              return _context.abrupt("return", r.has(id) ? gExpA(id) : Promise.resolve("".concat(mid)).then(function (s) {
                return _interopRequireWildcard(require(s));
              }));

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _dI.apply(this, arguments);
  }

  function gC(id, main) {
    return {
      id: id,
      "import": function _import(m) {
        return dI(m, id);
      },
      meta: {
        url: id,
        main: main
      }
    };
  }

  function gE(exp) {
    return function (id, v) {
      v = typeof id === "string" ? _defineProperty({}, id, v) : id;

      for (var _i = 0, _Object$entries = Object.entries(v); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
            _id = _Object$entries$_i[0],
            value = _Object$entries$_i[1];

        Object.defineProperty(exp, _id, {
          value: value,
          writable: true,
          enumerable: true
        });
      }
    };
  }

  function rF(main) {
    var _iterator = _createForOfIteratorHelper(r.entries()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _slicedToArray(_step.value, 2),
            id = _step$value[0],
            m = _step$value[1];

        var f = m.f,
            exp = m.exp;

        var _f = f(gE(exp), gC(id, id === main)),
            e = _f.execute,
            s = _f.setters;

        delete m.f;
        m.e = e;
        m.s = s;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  function gExpA(_x3) {
    return _gExpA.apply(this, arguments);
  }

  function _gExpA() {
    _gExpA = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(id) {
      var m, d, e, s, i, _r;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (r.has(id)) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return");

            case 2:
              m = r.get(id);

              if (!m.s) {
                _context2.next = 22;
                break;
              }

              d = m.d, e = m.e, s = m.s;
              delete m.s;
              delete m.e;
              i = 0;

            case 8:
              if (!(i < s.length)) {
                _context2.next = 18;
                break;
              }

              _context2.t0 = s;
              _context2.t1 = i;
              _context2.next = 13;
              return gExpA(d[i]);

            case 13:
              _context2.t2 = _context2.sent;

              _context2.t0[_context2.t1].call(_context2.t0, _context2.t2);

            case 15:
              i++;
              _context2.next = 8;
              break;

            case 18:
              _r = e();

              if (!_r) {
                _context2.next = 22;
                break;
              }

              _context2.next = 22;
              return _r;

            case 22:
              return _context2.abrupt("return", m.exp);

            case 23:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _gExpA.apply(this, arguments);
  }

  function gExp(id) {
    if (!r.has(id)) return;
    var m = r.get(id);

    if (m.s) {
      var d = m.d,
          e = m.e,
          s = m.s;
      delete m.s;
      delete m.e;

      for (var i = 0; i < s.length; i++) {
        s[i](gExp(d[i]));
      }

      e();
    }

    return m.exp;
  }

  _instantiate = function __instantiate(m, a) {
    System = _instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("serialize_property_options_map", [], function (exports_1, context_1) {
  "use strict";

  var ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY, ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY, SerializePropertyOptionsMap;

  var __moduleName = context_1 && context_1.id;

  return {
    setters: [],
    execute: function execute() {
      exports_1("ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY", ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY = "This key name is already in use by another property, please use a different name");
      exports_1("ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY", ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY = "This serialize key is already in use by another property, please use a different name");

      SerializePropertyOptionsMap = /*#__PURE__*/function () {
        function SerializePropertyOptionsMap(parentMap) {
          _classCallCheck(this, SerializePropertyOptionsMap);

          this.parentMap = parentMap;
          this.propertyKeyMap = new Map();
          this.serializedKeyMap = new Map();
          this.propertyKeyIgnoreSet = new Set();
          this.serializedKeyIgnoreSet = new Set();
        }

        _createClass(SerializePropertyOptionsMap, [{
          key: "set",
          value: function set(serializePropertyOptions) {
            var _this$parentMap, _this$parentMap2;

            if (this.serializedKeyMap.has(serializePropertyOptions.serializedKey)) {
              throw new Error("".concat(ERROR_MESSAGE_DUPLICATE_SERIALIZE_KEY, ": ").concat(serializePropertyOptions.serializedKey));
            }

            if (this.propertyKeyMap.has(serializePropertyOptions.propertyKey)) {
              throw new Error("".concat(ERROR_MESSAGE_DUPLICATE_PROPERTY_KEY, ": ").concat(serializePropertyOptions.propertyKey.toString()));
            }

            this.propertyKeyIgnoreSet["delete"](serializePropertyOptions.propertyKey);
            this.propertyKeyMap.set(serializePropertyOptions.propertyKey, serializePropertyOptions);
            this.serializedKeyIgnoreSet["delete"](serializePropertyOptions.serializedKey);
            this.serializedKeyMap.set(serializePropertyOptions.serializedKey, serializePropertyOptions);
            var parentSerializedObject = (_this$parentMap = this.parentMap) === null || _this$parentMap === void 0 ? void 0 : _this$parentMap.getBySerializedKey(serializePropertyOptions.serializedKey);

            if (parentSerializedObject && parentSerializedObject.propertyKey !== serializePropertyOptions.propertyKey) {
              this.propertyKeyIgnoreSet.add(parentSerializedObject.propertyKey);
            }

            var parentPropertyObject = (_this$parentMap2 = this.parentMap) === null || _this$parentMap2 === void 0 ? void 0 : _this$parentMap2.getByPropertyKey(serializePropertyOptions.propertyKey);

            if (parentPropertyObject && parentPropertyObject.serializedKey !== serializePropertyOptions.serializedKey) {
              this.serializedKeyIgnoreSet.add(parentPropertyObject.serializedKey);
            }
          }
        }, {
          key: "hasPropertyKey",
          value: function hasPropertyKey(propertyKey) {
            var _this$parentMap3;

            return this.propertyKeyMap.has(propertyKey) || !this.propertyKeyIgnoreSet.has(propertyKey) && ((_this$parentMap3 = this.parentMap) === null || _this$parentMap3 === void 0 ? void 0 : _this$parentMap3.hasPropertyKey(propertyKey)) || false;
          }
        }, {
          key: "getByPropertyKey",
          value: function getByPropertyKey(propertyKey) {
            var _this$parentMap4;

            return this.propertyKeyMap.get(propertyKey) || !this.propertyKeyIgnoreSet.has(propertyKey) && ((_this$parentMap4 = this.parentMap) === null || _this$parentMap4 === void 0 ? void 0 : _this$parentMap4.getByPropertyKey(propertyKey)) || undefined;
          }
        }, {
          key: "hasSerializedKey",
          value: function hasSerializedKey(serializedKey) {
            var _this$parentMap5;

            return this.serializedKeyMap.has(serializedKey) || !this.serializedKeyIgnoreSet.has(serializedKey) && ((_this$parentMap5 = this.parentMap) === null || _this$parentMap5 === void 0 ? void 0 : _this$parentMap5.hasSerializedKey(serializedKey)) || false;
          }
        }, {
          key: "getBySerializedKey",
          value: function getBySerializedKey(serializedKey) {
            var _this$parentMap6;

            return this.serializedKeyMap.get(serializedKey) || !this.serializedKeyIgnoreSet.has(serializedKey) && ((_this$parentMap6 = this.parentMap) === null || _this$parentMap6 === void 0 ? void 0 : _this$parentMap6.getBySerializedKey(serializedKey)) || undefined;
          }
        }, {
          key: "getMergedWithParentMap",
          value: function getMergedWithParentMap() {
            var _this$parentMap7,
                _this = this;

            var parentEntries = Array.from(((_this$parentMap7 = this.parentMap) === null || _this$parentMap7 === void 0 ? void 0 : _this$parentMap7.getMergedWithParentMap()) || []);
            return new Map([].concat(_toConsumableArray(parentEntries.filter(function (e) {
              return !_this.propertyKeyIgnoreSet.has(e[0]);
            })), _toConsumableArray(this.propertyKeyMap)));
          }
        }, {
          key: "propertyOptions",
          value: function propertyOptions() {
            return this.getMergedWithParentMap().values();
          }
        }]);

        return SerializePropertyOptionsMap;
      }();

      exports_1("SerializePropertyOptionsMap", SerializePropertyOptionsMap);
    }
  };
});
System.register("to_json/default_to_json", [], function (exports_2, context_2) {
  "use strict";

  var __moduleName = context_2 && context_2.id;

  function defaultToJson(value) {
    return value;
  }

  exports_2("defaultToJson", defaultToJson);
  return {
    setters: [],
    execute: function execute() {}
  };
});
System.register("to_json/recursive_to_json", ["serializable"], function (exports_3, context_3) {
  "use strict";

  var serializable_ts_1;

  var __moduleName = context_3 && context_3.id;

  function recursiveToJson(value) {
    return serializable_ts_1.toPojo(value);
  }

  exports_3("recursiveToJson", recursiveToJson);
  return {
    setters: [function (serializable_ts_1_1) {
      serializable_ts_1 = serializable_ts_1_1;
    }],
    execute: function execute() {}
  };
});
System.register("serializable", ["to_json/default_to_json", "to_json/recursive_to_json"], function (exports_4, context_4) {
  "use strict";

  var default_to_json_ts_1, recursive_to_json_ts_1, SerializePropertyOptions, SERIALIZABLE_CLASS_MAP, ERROR_MESSAGE_MISSING_PROPERTIES_MAP, Serializable;

  var __moduleName = context_4 && context_4.id;

  function composeStrategy() {
    for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    return function (val) {
      return fns.flat().reduce(function (acc, f) {
        return f(acc);
      }, val);
    };
  }

  exports_4("composeStrategy", composeStrategy);

  function toPojo(context) {
    var _context$constructor;

    var serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(context === null || context === void 0 ? void 0 : (_context$constructor = context.constructor) === null || _context$constructor === void 0 ? void 0 : _context$constructor.prototype);

    if (!serializablePropertyMap) {
      var _context$constructor2;

      throw new Error("".concat(ERROR_MESSAGE_MISSING_PROPERTIES_MAP, ": ").concat(context === null || context === void 0 ? void 0 : (_context$constructor2 = context.constructor) === null || _context$constructor2 === void 0 ? void 0 : _context$constructor2.prototype));
    }

    var record = {};

    var _iterator2 = _createForOfIteratorHelper(serializablePropertyMap.propertyOptions()),
        _step2;

    try {
      var _loop = function _loop() {
        var _value$constructor;

        var _step2$value = _step2.value,
            propertyKey = _step2$value.propertyKey,
            serializedKey = _step2$value.serializedKey,
            _step2$value$toJsonSt = _step2$value.toJsonStrategy,
            toJsonStrategy = _step2$value$toJsonSt === void 0 ? default_to_json_ts_1.defaultToJson : _step2$value$toJsonSt;
        var value = context[propertyKey];

        if (SERIALIZABLE_CLASS_MAP.get(value === null || value === void 0 ? void 0 : (_value$constructor = value.constructor) === null || _value$constructor === void 0 ? void 0 : _value$constructor.prototype)) {
          toJsonStrategy = recursive_to_json_ts_1.recursiveToJson;
        }

        if (Array.isArray(value)) {
          record[serializedKey] = value.map(function (v) {
            return toJsonStrategy(v);
          });
        } else if (value !== undefined) {
          record[serializedKey] = toJsonStrategy(value);
        }
      };

      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        _loop();
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }

    return record;
  }

  exports_4("toPojo", toPojo);

  function _toJson(context) {
    return JSON.stringify(toPojo(context));
  }

  function _fromJson(context, json) {
    var _context$constructor3;

    var serializablePropertyMap = SERIALIZABLE_CLASS_MAP.get(context === null || context === void 0 ? void 0 : (_context$constructor3 = context.constructor) === null || _context$constructor3 === void 0 ? void 0 : _context$constructor3.prototype);

    if (!serializablePropertyMap) {
      var _context$constructor4;

      throw new Error("".concat(ERROR_MESSAGE_MISSING_PROPERTIES_MAP, ": ").concat(context === null || context === void 0 ? void 0 : (_context$constructor4 = context.constructor) === null || _context$constructor4 === void 0 ? void 0 : _context$constructor4.prototype));
    }

    var _json = typeof json === "string" ? json : JSON.stringify(json);

    return Object.assign(context, JSON.parse(_json, function revive(key, value) {
      if (key === "") {
        return value;
      }

      var _ref2 = serializablePropertyMap.getBySerializedKey(key) || {},
          propertyKey = _ref2.propertyKey,
          _ref2$fromJsonStrateg = _ref2.fromJsonStrategy,
          fromJsonStrategy = _ref2$fromJsonStrateg === void 0 ? function (v) {
        return v;
      } : _ref2$fromJsonStrateg;

      var processedValue = Array.isArray(value) ? value.map(function (v) {
        return fromJsonStrategy(v);
      }) : fromJsonStrategy(value);

      if (propertyKey) {
        context[propertyKey] = processedValue;
        return;
      }

      return processedValue;
    }));
  }

  return {
    setters: [function (default_to_json_ts_1_1) {
      default_to_json_ts_1 = default_to_json_ts_1_1;
    }, function (recursive_to_json_ts_1_1) {
      recursive_to_json_ts_1 = recursive_to_json_ts_1_1;
    }],
    execute: function execute() {
      SerializePropertyOptions = function SerializePropertyOptions(propertyKey, serializedKey, fromJsonStrategy, toJsonStrategy) {
        _classCallCheck(this, SerializePropertyOptions);

        this.propertyKey = propertyKey;
        this.serializedKey = serializedKey;

        if (Array.isArray(fromJsonStrategy)) {
          this.fromJsonStrategy = composeStrategy.apply(void 0, _toConsumableArray(fromJsonStrategy));
        } else if (fromJsonStrategy) {
          this.fromJsonStrategy = fromJsonStrategy;
        }

        if (Array.isArray(toJsonStrategy)) {
          this.toJsonStrategy = composeStrategy.apply(void 0, _toConsumableArray(toJsonStrategy));
        } else if (toJsonStrategy) {
          this.toJsonStrategy = toJsonStrategy;
        }
      };

      exports_4("SerializePropertyOptions", SerializePropertyOptions);
      exports_4("SERIALIZABLE_CLASS_MAP", SERIALIZABLE_CLASS_MAP = new Map());
      ERROR_MESSAGE_MISSING_PROPERTIES_MAP = "Unable to load serializer properties for the given context";

      Serializable = /*#__PURE__*/function () {
        function Serializable() {
          _classCallCheck(this, Serializable);
        }

        _createClass(Serializable, [{
          key: "toJson",
          value: function toJson() {
            return _toJson(this);
          }
        }, {
          key: "fromJson",
          value: function fromJson() {
            var json = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return _fromJson(this, json);
          }
        }]);

        return Serializable;
      }();

      exports_4("Serializable", Serializable);
    }
  };
});
System.register("serialize_property", ["serializable", "serialize_property_options_map"], function (exports_5, context_5) {
  "use strict";

  var serializable_ts_2, serialize_property_options_map_ts_1, ERROR_MESSAGE_SYMBOL_PROPERTY_NAME;

  var __moduleName = context_5 && context_5.id;

  function SerializeProperty() {
    var decoratorArguments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return function (target, propertyName) {
      var decoratorArgumentOptions;

      if (typeof decoratorArguments === "string") {
        decoratorArgumentOptions = {
          serializedKey: decoratorArguments
        };
      } else {
        if (!decoratorArguments.serializedKey && _typeof(propertyName) === "symbol") {
          throw new Error(ERROR_MESSAGE_SYMBOL_PROPERTY_NAME);
        }

        decoratorArgumentOptions = _objectSpread({
          serializedKey: propertyName
        }, decoratorArguments);
      }

      var serializablePropertiesMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP.get(target);

      if (!serializablePropertiesMap) {
        var parentMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP.get(Object.getPrototypeOf(target));
        serializable_ts_2.SERIALIZABLE_CLASS_MAP.set(target, new serialize_property_options_map_ts_1.SerializePropertyOptionsMap(parentMap));
        serializablePropertiesMap = serializable_ts_2.SERIALIZABLE_CLASS_MAP.get(target);
      }

      serializablePropertiesMap.set(new serializable_ts_2.SerializePropertyOptions(propertyName, decoratorArgumentOptions.serializedKey, decoratorArgumentOptions.fromJsonStrategy, decoratorArgumentOptions.toJsonStrategy));
    };
  }

  exports_5("SerializeProperty", SerializeProperty);
  return {
    setters: [function (serializable_ts_2_1) {
      serializable_ts_2 = serializable_ts_2_1;
    }, function (serialize_property_options_map_ts_1_1) {
      serialize_property_options_map_ts_1 = serialize_property_options_map_ts_1_1;
    }],
    execute: function execute() {
      exports_5("ERROR_MESSAGE_SYMBOL_PROPERTY_NAME", ERROR_MESSAGE_SYMBOL_PROPERTY_NAME = "The key name cannot be inferred from a symbol. A value for serializedName must be provided");
    }
  };
});
System.register("from_json/date_from_json", [], function (exports_6, context_6) {
  "use strict";

  var ISODateFromJson;

  var __moduleName = context_6 && context_6.id;

  function createDateStrategy(regex) {
    return function (value) {
      return typeof value === "string" && regex.exec(value) ? new Date(value) : value;
    };
  }

  exports_6("createDateStrategy", createDateStrategy);
  return {
    setters: [],
    execute: function execute() {
      exports_6("ISODateFromJson", ISODateFromJson = createDateStrategy(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/));
    }
  };
});
System.register("from_json/from_json_as", [], function (exports_7, context_7) {
  "use strict";

  var __moduleName = context_7 && context_7.id;

  function fromJsonAs(type) {
    return function (value) {
      return new type().fromJson(value);
    };
  }

  exports_7("fromJsonAs", fromJsonAs);
  return {
    setters: [],
    execute: function execute() {}
  };
});
System.register("mod", ["serialize_property", "serializable", "from_json/date_from_json", "from_json/from_json_as", "to_json/default_to_json", "to_json/recursive_to_json"], function (exports_8, context_8) {
  "use strict";

  var __moduleName = context_8 && context_8.id;

  return {
    setters: [function (serialize_property_ts_1_1) {
      exports_8({
        "SerializeProperty": serialize_property_ts_1_1["SerializeProperty"]
      });
    }, function (serializable_ts_3_1) {
      exports_8({
        "Serializable": serializable_ts_3_1["Serializable"],
        "composeStrategy": serializable_ts_3_1["composeStrategy"]
      });
    }, function (date_from_json_ts_1_1) {
      exports_8({
        "createDateStrategy": date_from_json_ts_1_1["createDateStrategy"],
        "ISODateFromJson": date_from_json_ts_1_1["ISODateFromJson"]
      });
    }, function (from_json_as_ts_1_1) {
      exports_8({
        "fromJsonAs": from_json_as_ts_1_1["fromJsonAs"]
      });
    }, function (default_to_json_ts_2_1) {
      exports_8({
        "defaultToJson": default_to_json_ts_2_1["defaultToJson"]
      });
    }, function (recursive_to_json_ts_2_1) {
      exports_8({
        "recursiveToJson": recursive_to_json_ts_2_1["recursiveToJson"]
      });
    }],
    execute: function execute() {}
  };
});

var __exp = _instantiate("mod", false);

var SerializeProperty = __exp["SerializeProperty"];
exports.SerializeProperty = SerializeProperty;
var Serializable = __exp["Serializable"];
exports.Serializable = Serializable;
var FromJsonStrategy = __exp["FromJsonStrategy"];
exports.FromJsonStrategy = FromJsonStrategy;
var ToJsonStrategy = __exp["ToJsonStrategy"];
exports.ToJsonStrategy = ToJsonStrategy;
var composeStrategy = __exp["composeStrategy"];
exports.composeStrategy = composeStrategy;
var createDateStrategy = __exp["createDateStrategy"];
exports.createDateStrategy = createDateStrategy;
var ISODateFromJson = __exp["ISODateFromJson"];
exports.ISODateFromJson = ISODateFromJson;
var fromJsonAs = __exp["fromJsonAs"];
exports.fromJsonAs = fromJsonAs;
var defaultToJson = __exp["defaultToJson"];
exports.defaultToJson = defaultToJson;
var recursiveToJson = __exp["recursiveToJson"];
exports.recursiveToJson = recursiveToJson;
