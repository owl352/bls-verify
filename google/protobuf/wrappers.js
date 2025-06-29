'use strict'
// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.1
//   protoc               v3.19.1
// source: google/protobuf/wrappers.proto
Object.defineProperty(exports, '__esModule', { value: true })
exports.BytesValue = exports.StringValue = exports.BoolValue = exports.UInt32Value = exports.Int32Value = exports.UInt64Value = exports.Int64Value = exports.FloatValue = exports.DoubleValue = exports.protobufPackage = void 0
/* eslint-disable */
var wire_1 = require("@bufbuild/protobuf/wire");
exports.protobufPackage = "google.protobuf";
function createBaseDoubleValue() {
    return { value: 0 };
}
exports.DoubleValue = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== 0) {
            writer.uint32(9).double(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseDoubleValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 9) {
                        break;
                    }
                    message.value = reader.double();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.DoubleValue.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseDoubleValue();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : 0;
        return message;
    },
};
function createBaseFloatValue() {
    return { value: 0 };
}
exports.FloatValue = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== 0) {
            writer.uint32(13).float(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseFloatValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 13) {
                        break;
                    }
                    message.value = reader.float();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.FloatValue.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseFloatValue();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : 0;
        return message;
    },
};
function createBaseInt64Value() {
    return { value: "0" };
}
exports.Int64Value = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== "0") {
            writer.uint32(8).int64(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseInt64Value();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 8) {
                        break;
                    }
                    message.value = reader.int64().toString();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.Int64Value.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseInt64Value();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseUInt64Value() {
    return { value: "0" };
}
exports.UInt64Value = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== "0") {
            writer.uint32(8).uint64(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUInt64Value();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 8) {
                        break;
                    }
                    message.value = reader.uint64().toString();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.UInt64Value.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseUInt64Value();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : "0";
        return message;
    },
};
function createBaseInt32Value() {
    return { value: 0 };
}
exports.Int32Value = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== 0) {
            writer.uint32(8).int32(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseInt32Value();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 8) {
                        break;
                    }
                    message.value = reader.int32();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.Int32Value.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseInt32Value();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : 0;
        return message;
    },
};
function createBaseUInt32Value() {
    return { value: 0 };
}
exports.UInt32Value = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== 0) {
            writer.uint32(8).uint32(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseUInt32Value();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 8) {
                        break;
                    }
                    message.value = reader.uint32();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.UInt32Value.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseUInt32Value();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : 0;
        return message;
    },
};
function createBaseBoolValue() {
    return { value: false };
}
exports.BoolValue = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== false) {
            writer.uint32(8).bool(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseBoolValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 8) {
                        break;
                    }
                    message.value = reader.bool();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.BoolValue.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseBoolValue();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : false;
        return message;
    },
};
function createBaseStringValue() {
    return { value: "" };
}
exports.StringValue = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value !== "") {
            writer.uint32(10).string(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseStringValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 10) {
                        break;
                    }
                    message.value = reader.string();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.StringValue.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseStringValue();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseBytesValue() {
    return { value: new Uint8Array(0) };
}
exports.BytesValue = {
    encode: function (message, writer) {
        if (writer === void 0) { writer = new wire_1.BinaryWriter(); }
        if (message.value.length !== 0) {
            writer.uint32(10).bytes(message.value);
        }
        return writer;
    },
    decode: function (input, length) {
        var reader = input instanceof wire_1.BinaryReader ? input : new wire_1.BinaryReader(input);
        var end = length === undefined ? reader.len : reader.pos + length;
        var message = createBaseBytesValue();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    if (tag !== 10) {
                        break;
                    }
                    message.value = reader.bytes();
                    continue;
                }
            }
            if ((tag & 7) === 4 || tag === 0) {
                break;
            }
            reader.skip(tag & 7);
        }
        return message;
    },
    create: function (base) {
        return exports.BytesValue.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial: function (object) {
        var _a;
        var message = createBaseBytesValue();
        message.value = (_a = object.value) !== null && _a !== void 0 ? _a : new Uint8Array(0);
        return message;
    },
};