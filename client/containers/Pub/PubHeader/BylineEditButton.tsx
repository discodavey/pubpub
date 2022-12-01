import React from 'react';
import { Button } from 'ariakit/Button';

import { Icon } from 'components';

require('./bylineEditButton.scss');

type Props = {
	onClick: (...args: any[]) => any;
};

const BylineEditButton = (props: Props) => {
	const { onClick } = props;
	return (
		<Button className="byline-edit-button-component" onClick={onClick} aria-label="Edit byline">
			<div className="icon-box pub-header-themed-box pub-header-themed-box-hover-target">
				<Icon icon="edit2" iconSize={14} />
			</div>
		</Button>
	);
};
export default BylineEditButton;
