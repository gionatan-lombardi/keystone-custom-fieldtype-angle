import React from 'react';
import Field from 'keystone/fields/types/Field';
import { FormInput } from 'keystone/admin/client/App/elemental';

module.exports = Field.create({
	displayName: 'NumberField',
	statics: {
		type: 'Number',
	},
	valueChanged (event) {
		var newValue = event.target.value;
		if (/^-?\d*\.?\d*$/.test(newValue)) {
			this.props.onChange({
				path: this.props.path,
				value: newValue,
			});
		}
	},
	renderField () {
		return (
			<FormInput
				autoComplete="off"
				name={this.getInputName(this.props.path)}
				onChange={this.valueChanged}
				ref="focusTarget"
				value={this.props.value}
			/>
		);
	},
});
