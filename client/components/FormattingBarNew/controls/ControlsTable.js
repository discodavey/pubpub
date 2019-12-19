import React from 'react';
import { Toolbar, ToolbarItem, useToolbarState } from 'reakit';
import { Button } from '@blueprintjs/core';

import CommandMenu from '../CommandMenu';
import FormattingBarButton from '../FormattingBarButton';

const rowCommands = [
	{ key: 'table-add-row-before', title: 'Add row before', icon: 'add-row-top' },
	{ key: 'table-add-row-after', title: 'Add row after', icon: 'add-row-bottom' },
	{ key: 'table-toggle-header-row', title: 'Toggle header row', icon: 'page-layout' },
	{ key: 'table-delete-row', title: 'Delete row', icon: 'trash' },
];

const columnCommands = [
	{ key: 'table-add-column-before', title: 'Add column before', icon: 'add-column-left' },
	{ key: 'table-add-column-after', title: 'Add column after', icon: 'add-column-right' },
	{ key: 'table-toggle-header-column', title: 'Toggle column row', icon: 'page-layout' },
	{ key: 'table-delete-column', title: 'Delete column', icon: 'trash' },
];

const buttonCommands = [
	{ key: 'table-merge-cells', title: 'Merge cells', icon: 'merge-columns' },
	{ key: 'table-split-cell', title: 'Split cells', icon: 'split-columns' },
	{ key: 'toggle-header-cell', title: 'Toggle header cells', icon: 'header' },
	{ key: 'table-delete', title: 'Remove table', icon: 'trash' },
];

const ControlsTable = (props) => {
	const { editorChangeObject } = props;
	const { menuItems = [], view } = editorChangeObject;
	const toolbar = useToolbarState({ loop: true });

	// eslint-disable-next-line react/prop-types
	const renderDisclosure = ({ ref, ...disclosureProps }) => {
		return (
			<Button
				minimal
				className="block-type-selector-component"
				rightIcon="caret-down"
				elementRef={ref}
				icon="th"
				{...disclosureProps}
			/>
		);
	};

	return (
		<Toolbar {...toolbar} className="controls-table-component" aria-label="Table options">
			<ToolbarItem
				aria-label="Table options"
				as={CommandMenu}
				disclosure={renderDisclosure}
				commands={[...rowCommands, ...columnCommands, ...buttonCommands]}
				editorChangeObject={editorChangeObject}
				{...toolbar}
			/>
			{/* <ToolbarItem
				aria-label="Column options"
				as={CommandMenu}
				disclosure={renderDisclosure('Column')}
				commands={columnCommands}
				editorChangeObject={editorChangeObject}
				{...toolbar}
			/>
			{buttonCommands.map((buttonCommand) => {
				const menuItem = menuItems.find((item) => item.title === buttonCommand.key);
				if (!menuItem || !menuItem.canRun) {
					return null;
				}
				return (
					<ToolbarItem
						key={buttonCommand.key}
						as={FormattingBarButton}
						formattingItem={buttonCommand}
						onClick={() => {
							menuItem.run();
							view.focus();
						}}
						{...toolbar}
					/>
				);
			})} */}
		</Toolbar>
	);
};

export default ControlsTable;
