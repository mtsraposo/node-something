const avro = require('avsc');

class DateType extends avro.types.LogicalType {
    _fromValue(val) {
        return new Date(val);
    }

    _toValue(date) {
        return +date;
    }

    _resolve(type) {
        if (avro.Type.isType(type, 'long', 'string', 'logical:timestamp-millis')) {
            return this._fromValue;
        }
    }
}

module.export = { DateType };
