import { useState, useRef, useEffect, useCallback } from 'react';

const isChildOfReakitPortal = (element) => {
	const ancestors = [];
	ancestors.push(element);
	while (element.parentNode) {
		ancestors.unshift(element.parentNode);
		// eslint-disable-next-line no-param-reassign
		element = element.parentNode;
	}
	return ancestors.some(
		(ancestor) => ancestor.classList && ancestor.classList.contains('__reakit-portal'),
	);
};

const rememberScrollPosition = () => {
	const { scrollX, scrollY } = window;
	return {
		restore: () => {
			if (typeof window.scrollTo === 'function') {
				window.scrollTo(scrollX, scrollY);
			}
		},
	};
};

// This implementation heavily inspired by the wonder-blocks focus trap:
// https://github.com/Khan/wonder-blocks/blob/master/packages/wonder-blocks-modal/components/focus-trap.js
export const useFocusTrap = ({ onClickOutside, isActive } = {}) => {
	const [rootElement, setRefElement] = useState(null);
	const ignoreFocusChanges = useRef(false);
	const lastNodeFocusedInModal = useRef(null);
	const lastGoodScrollPosition = useRef(null);

	const tryToFocus = useCallback((node) => {
		if (node instanceof HTMLElement) {
			ignoreFocusChanges.current = true;
			try {
				node.focus();
			} catch (e) {
				// ignore error
			}
			ignoreFocusChanges.current = false;
			return document.activeElement === node;
		}
		return false;
	}, []);

	const focusLastElementIn = useCallback(
		(currentParent) => {
			const children = currentParent.childNodes;
			for (let i = children.length - 1; i >= 0; i -= 1) {
				const child = children[i];
				if (tryToFocus(child) || focusLastElementIn(child)) {
					return true;
				}
			}
			return false;
		},
		[tryToFocus],
	);

	const focusFirstElementIn = useCallback(
		(currentParent) => {
			const children = currentParent.childNodes;
			for (let i = 0; i < children.length; i += 1) {
				const child = children[i];
				if (tryToFocus(child) || focusFirstElementIn(child)) {
					return true;
				}
			}
			return false;
		},
		[tryToFocus],
	);

	const handleGlobalFocus = useCallback(
		(evt) => {
			const { target } = evt;

			// We can ignore a focus event if:
			const eventIsIgnorable =
				// 1. it is triggered by this hook's own attempts to move focus
				ignoreFocusChanges.current ||
				// 2. the hook is not active
				!isActive ||
				// 3. the focus is set to the document itself
				!(target instanceof Node) ||
				// 4. we don't have a reference to a container element yet
				!rootElement;

			if (eventIsIgnorable) {
				return;
			}

			if (rootElement.contains(target)) {
				lastNodeFocusedInModal.current = target;

				// Keep track of our scroll position so we can restore it later
				lastGoodScrollPosition.current = rememberScrollPosition();
			} else {
				if (isChildOfReakitPortal(target)) {
					return;
				}

				// Restore our last good scroll position
				if (lastGoodScrollPosition.current) {
					lastGoodScrollPosition.current.restore();
				}

				// If the newly focused node is outside the modal, we try refocusing
				// the first focusable node of the modal. (This could be the user
				// pressing Tab on the last node of the modal, or focus escaping in
				// some other way.)
				focusFirstElementIn(rootElement);

				// But, if it turns out that the first focusable node of the modal
				// was what we were previously focusing, then this is probably the
				// user pressing Shift-Tab on the first node, wanting to go to the
				// end. So, we instead try focusing the last focusable node of the
				// modal.
				if (document.activeElement === lastNodeFocusedInModal.current) {
					focusLastElementIn(rootElement);
				}

				// Focus should now be inside the modal, so record the newly-focused
				// node as the last node focused in the modal.
				lastNodeFocusedInModal.current = document.activeElement;
			}
		},
		[focusFirstElementIn, focusLastElementIn, isActive, rootElement],
	);

	const handleGlobalClick = useCallback(
		(evt) => {
			const { target } = evt;
			if (!rootElement.contains(target) && !isChildOfReakitPortal(target) && isActive) {
				if (onClickOutside) {
					onClickOutside(target);
				}
			}
		},
		[isActive, onClickOutside, rootElement],
	);

	useEffect(() => {
		window.addEventListener('focus', handleGlobalFocus, true);
		return () => window.removeEventListener('focus', handleGlobalFocus, true);
	}, [handleGlobalFocus]);

	useEffect(() => {
		window.addEventListener('click', handleGlobalClick, true);
		return () => window.removeEventListener('click', handleGlobalClick, true);
	}, [handleGlobalClick]);

	useEffect(() => {
		if (rootElement && isActive) {
			const previousTabIndex = rootElement.tabIndex;
			rootElement.tabIndex = -1;
			tryToFocus(rootElement);
			return () => {
				rootElement.tabIndex = previousTabIndex;
			};
		}
		return () => {};
	}, [isActive, rootElement, tryToFocus]);

	useEffect(() => {
		const previouslyActiveElement = document.activeElement;
		return () => {
			const initialScrollPosition = rememberScrollPosition();
			tryToFocus(previouslyActiveElement);
			initialScrollPosition.restore();
		};
	}, [tryToFocus]);

	return {
		ref: setRefElement,
	};
};
