import ControlsEquation from './controls/ControlsEquation';
import ControlsFootnoteCitation from './controls/ControlsFootnoteCitation';
import ControlsLink from './controls/ControlsLink';
import ControlsMedia from './controls/ControlsMedia/ControlsMedia';
import ControlsTable from './controls/ControlsTable';
import MediaButton from './FormattingBarMediaButton';

const triggerOnClick = (changeObject) => {
	const { latestDomEvent } = changeObject;
	return latestDomEvent && latestDomEvent.type === 'click';
};

const nodeControls = (component, indicatedNodeType) => {
	const indicatedTypes = Array.isArray(indicatedNodeType)
		? indicatedNodeType
		: [indicatedNodeType];
	return {
		enterKeyTriggers: true,
		component: component,
		trigger: triggerOnClick,
		show: (editorChangeObject) => !!editorChangeObject.selectedNode,
		indicate: (editorChangeObject) => {
			const { selectedNode } = editorChangeObject;
			return selectedNode && indicatedTypes.some((type) => type === selectedNode.type.name);
		},
	};
};

const getPositionForBounds = (getBoundsFn) => (changeObject, containerRef) => {
	const wrapperBounds = containerRef.current.offsetParent.getBoundingClientRect();
	const bounds = getBoundsFn(changeObject);
	return {
		top: bounds.bottom - wrapperBounds.top,
		left: bounds.left - wrapperBounds.left,
	};
};

export const strong = {
	key: 'strong',
	title: 'Bold',
	icon: 'bold',
	isToggle: true,
};

export const em = {
	key: 'em',
	title: 'Italic',
	icon: 'italic',
	isToggle: true,
};

export const link = {
	key: 'link',
	title: 'Link',
	icon: 'link',
	isToggle: true,
	controls: {
		component: ControlsLink,
		indicate: (changeObject) => !!changeObject.activeLink,
		trigger: (changeObject) => {
			const { latestDomEvent } = changeObject;
			return (
				(latestDomEvent && latestDomEvent.metaKey && latestDomEvent.key === 'k') ||
				triggerOnClick(changeObject)
			);
		},
		show: (changeObject) => !!changeObject.activeLink,
		position: getPositionForBounds((changeObject) => changeObject.activeLink.boundingBox),
	},
};

export const bulletList = {
	key: 'bullet-list',
	title: 'Bullet List',
	icon: 'list-ul',
};

export const numberedList = {
	key: 'numbered-list',
	title: 'Numbered List',
	icon: 'list-ol',
};

export const blockquote = {
	key: 'blockquote',
	title: 'Blockquote',
	icon: 'citation',
};

export const code = {
	key: 'code',
	title: 'Code',
	icon: 'code',
	isToggle: true,
};

export const subscript = {
	key: 'subscript',
	title: 'Subscript',
	icon: 'subscript',
	isToggle: true,
};

export const superscript = {
	key: 'superscript',
	title: 'Superscript',
	icon: 'superscript',
	isToggle: true,
};

export const strikethrough = {
	key: 'strikethrough',
	title: 'Strikethrough',
	ariaTitle: 'strike through',
	icon: 'strikethrough',
	isToggle: true,
};

export const citation = {
	key: 'citation',
	title: 'Citation',
	icon: 'bookmark',
	controls: nodeControls(ControlsFootnoteCitation, 'citation'),
};

export const equation = {
	key: 'equation',
	title: 'Equation',
	icon: 'function',
	controls: nodeControls(ControlsEquation, ['equation', 'block_equation']),
};

export const footnote = {
	key: 'footnote',
	title: 'Footnote',
	icon: 'asterisk',
	controls: nodeControls(ControlsFootnoteCitation, 'footnote'),
};

export const horizontalRule = {
	key: 'horizontal_rule',
	title: 'Horizontal Line',
	icon: 'minus',
};

export const table = {
	key: 'table',
	title: 'Table',
	icon: 'th',
	controls: {
		indicate: ({ selectionInTable }) => selectionInTable,
		show: (editorChangeObject) =>
			editorChangeObject.selectionInTable && triggerOnClick(editorChangeObject),
		trigger: triggerOnClick,
		position: getPositionForBounds((changeObject) => changeObject.selectionBoundingBox),
		component: ControlsTable,
	},
};

export const media = {
	key: 'media',
	title: 'Media',
	icon: 'media',
	component: MediaButton,
	controls: nodeControls(ControlsMedia, ['image', 'video', 'audio', 'iframe']),
};

export const minimalButtonSet = [strong, em, link, equation];

export const fullButtonSet = [
	strong,
	em,
	link,
	bulletList,
	numberedList,
	blockquote,
	code,
	subscript,
	superscript,
	strikethrough,
	horizontalRule,
	equation,
	citation,
	footnote,
	table,
	media,
];
