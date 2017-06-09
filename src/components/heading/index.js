import React, { Component } from 'react';
import injectSheet from 'react-jss';

@injectSheet({
	//
})
export default class Heading extends Component {
	render() {
		const {
			children,
			size,
		} = this.props;

		return (
			<h1>{children}</h1>
		);
	}
}
