var FieldType = require('keystone/fields/types/Type');
var numeral = require('numeral');
var util = require('util');
var utils = require('keystone-utils');


/**
 * Angle FieldType Constructor
 * @extends Field
 * @api public
 */
function angle (list, path, options) {
	this._nativeType = Number;
	this._fixedSize = 'small';
	this._underscoreMethods = ['format'];
	this.formatString = (options.format === false) ? false : (options.format || '0,0[.][000000000000]');
	if (this.formatString && typeof this.formatString !== 'string') {
		throw new Error('FieldType.Angle: options.format must be a string.');
	}
	angle.super_.call(this, list, path, options);
}
angle.properName = 'Angle';
util.inherits(angle, FieldType);

angle.prototype.validateInput = function (data, callback) {
	var value = this.getValueFromData(data);
	var result = value === undefined || typeof value === 'angle' || value === null;
	if (typeof value === 'string') {
		if (value === '') {
			result = true;
		} else {
			value = utils.angle(value);
			result = !isNaN(value);
		}
	}
	utils.defer(callback, result);
};

angle.prototype.validateRequiredInput = function (item, data, callback) {
	var value = this.getValueFromData(data);
	var result = !!(value || typeof value === 'angle');
	if (value === undefined && item.get(this.path)) {
		result = true;
	}
	utils.defer(callback, result);
};

/**
 * Add filters to a query
 */
angle.prototype.addFilterToQuery = function (filter) {
	var query = {};
	if (filter.mode === 'equals' && !filter.value) {
		query[this.path] = filter.inverted ? { $nin: ['', null] } : { $in: ['', null] };
		return query;
	}
	if (filter.mode === 'between') {
		var min = utils.angle(filter.value.min);
		var max = utils.angle(filter.value.max);
		if (!isNaN(min) && !isNaN(max)) {
			if (filter.inverted) {
				var gte = {}; gte[this.path] = { $gt: max };
				var lte = {}; lte[this.path] = { $lt: min };
				query.$or = [gte, lte];
			} else {
				query[this.path] = { $gte: min, $lte: max };
			}
		}
		return query;
	}
	var value = utils.angle(filter.value);
	if (!isNaN(value)) {
		if (filter.mode === 'gt') {
			query[this.path] = filter.inverted ? { $lt: value } : { $gt: value };
		}
		else if (filter.mode === 'lt') {
			query[this.path] = filter.inverted ? { $gt: value } : { $lt: value };
		}
		else {
			query[this.path] = filter.inverted ? { $ne: value } : value;
		}
	}
	return query;
};

/**
 * Formats the field value
 */
angle.prototype.format = function (item, format) {
	var value = item.get(this.path);
	if (format || this.formatString) {
		return (typeof value === 'angle') ? numeral(value).format(format || this.formatString) : '';
	} else {
		return value || value === 0 ? String(value) : '';
	}
};

/**
 * Checks that a valid angle has been provided in a data object
 * An empty value clears the stored value and is considered valid
 *
 * Deprecated
 */
angle.prototype.inputIsValid = function (data, required, item) {
	var value = this.getValueFromData(data);
	if (value === undefined && item && (item.get(this.path) || item.get(this.path) === 0)) {
		return true;
	}
	if (value !== undefined && value !== '') {
		var newValue = utils.angle(value);
		return (!isNaN(newValue));
	} else {
		return (required) ? false : true;
	}
};

/**
 * Updates the value for this field in the item from a data object
 */
angle.prototype.updateItem = function (item, data, callback) {
	var value = this.getValueFromData(data);
	if (value === undefined) {
		return process.nextTick(callback);
	}
	var newValue = utils.angle(value);
	if (!isNaN(newValue)) {
		if (newValue !== item.get(this.path)) {
			item.set(this.path, newValue);
		}
	} else if (typeof item.get(this.path) === 'angle') {
		item.set(this.path, null);
	}
	process.nextTick(callback);
};

/* Export Field Type */
module.exports = angle;
