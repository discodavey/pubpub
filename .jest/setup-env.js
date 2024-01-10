/**
 * This file helps us prepare an environment for Jest tests to run. Because these run in Node rather
 * than the browser, there are some things we do to make these environments match. A lot of this is
 * handled by JSDom, but there are some edge cases.
 */

process.env.DOI_SUBMISSION_URL = '';
process.env.DOI_LOGIN_ID = '';
process.env.DOI_LOGIN_PASSWORD = '';
process.env.MATOMO_TOKEN_AUTH = '';
process.env.MAILGUN_API_KEY = 'some-nonsense';
process.env.MAILCHIMP_API_KEY = '';
process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = '';
process.env.CLOUDAMQP_APIKEY = '';
process.env.CLOUDAMQP_URL = '';
process.env.ALGOLIA_ID = 'ooo';
process.env.ALGOLIA_KEY = 'ooo';
process.env.ALGOLIA_SEARCH_KEY = 'ooo';
process.env.JWT_SIGNING_SECRET = 'shhhhhh';
process.env.FIREBASE_TEST_DB_URL = 'http://localhost:9875?ns=pubpub-v6';
process.env.ZOTERO_CLIENT_KEY = 'abc';
process.env.ZOTERO_CLIENT_SECRET = 'def';

process.env.FASTLY_PURGE_TOKEN_PROD = 'token';
process.env.FASTLY_SERVICE_ID_PROD = 'prod';

process.env.FASTLY_PURGE_TOKEN_DUQDUQ = 'token_duqduq';
process.env.FASTLY_SERVICE_ID_DUQDUQ = 'duqduq';

if (process.env.INTEGRATION) {
	try {
		require('../config.js');
	} catch (e) {
		console.log('No config.js found');
	}
} else {
	process.env.AWS_ACCESS_KEY_ID = '';
	process.env.AWS_SECRET_ACCESS_KEY = '';
}

if (typeof document !== 'undefined') {
	require('mutationobserver-shim');

	// ProseMirror uses document.getSelection, which is not polyfilled by JSDOM.
	document.getSelection = function () {
		return {
			focusNode: null,
			anchorNode: null,
			rangeCount: 0,
			addRange: () => {},
			removeAllRanges: () => {},
		};
	};

	// ProseMirror uses document.createRange, which is not polyfilled by JSDOM.
	document.createRange = function () {
		return {
			commonAncestorContainer: {
				ownerDocument: document,
			},
			setStart: () => {},
			setEnd: () => {},
			getClientRects: () => [],
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				right: 0,
				bottom: 0,
			}),
		};
	};

	// ProseMirror wants to use execCommand (probably for copy/paste)
	document.execCommand = () => true;
}

if (typeof window !== 'undefined') {
	window.requestIdleCallback = () => {};
}

// global.fetch = () => new Promise((resolve) => setTimeout(resolve), 1e4);

if (typeof window === 'undefined') {
	/**
	 * This is here because Jest overrides setImmediate in a strange way. This fixes
	 *
	 * @see {../utils/async/__tests__/async.test.ts}
	 */
	global.setImmediateNode = setImmediate;
}
