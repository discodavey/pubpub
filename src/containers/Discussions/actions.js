/*--------*/
// Define Action types
//
// All action types are defined as constants. Do not manually pass action
// types as strings in action creators
/*--------*/

export const GET_DISCUSSIONS_DATA_LOAD = 'discussions/GET_DISCUSSIONS_DATA_LOAD';
export const GET_DISCUSSIONS_DATA_SUCCESS = 'discussions/GET_DISCUSSIONS_DATA_SUCCESS';
export const GET_DISCUSSIONS_DATA_FAIL = 'discussions/GET_DISCUSSIONS_DATA_FAIL';

// export const ADD_DISCUSSION = 'discussions/ADD_DISCUSSION';
// export const ADD_DISCUSSION_SUCCESS = 'discussions/ADD_DISCUSSION_SUCCESS';
// export const ADD_DISCUSSION_FAIL = 'discussions/ADD_DISCUSSION_FAIL';

// export const DISCUSSION_VOTE = 'discussions/DISCUSSION_VOTE';
// export const DISCUSSION_VOTE_SUCCESS = 'discussions/DISCUSSION_VOTE_SUCCESS';
// export const DISCUSSION_VOTE_FAIL = 'discussions/DISCUSSION_VOTE_FAIL';

// export const ARCHIVE_DISCUSSION_LOAD = 'discussions/ARCHIVE_DISCUSSION_LOAD';
// export const ARCHIVE_DISCUSSION_SUCCESS = 'discussions/ARCHIVE_DISCUSSION_SUCCESS';
// export const ARCHIVE_DISCUSSION_FAIL = 'discussions/ARCHIVE_DISCUSSION_FAIL';

/*--------*/
// Define Action creators
//
// All calls to dispatch() call one of these functions. Do not manually create
// action objects (e.g. {type:example, payload:data} ) within dispatch()
// function calls
/*--------*/
export function getDiscussionsData(slug) {
	return {
		types: [GET_DISCUSSIONS_DATA_LOAD, GET_DISCUSSIONS_DATA_SUCCESS, GET_DISCUSSIONS_DATA_FAIL],
		promise: (client) => client.post('/getDiscussionsData', {data: {
			slug: slug
		}})
	};
}

// export function addDiscussion(discussionObject, activeSaveID) {
// 	return {
// 		types: [ADD_DISCUSSION, ADD_DISCUSSION_SUCCESS, ADD_DISCUSSION_FAIL],
// 		promise: (client) => client.post('/addDiscussion', {data: {discussionObject: discussionObject}}),
// 		activeSaveID: activeSaveID
// 	};
// }

// export function archiveDiscussion(objectID) {
// 	return {
// 		types: [ARCHIVE_DISCUSSION_LOAD, ARCHIVE_DISCUSSION_SUCCESS, ARCHIVE_DISCUSSION_FAIL],
// 		promise: (client) => client.post('/archiveDiscussion', {data: {objectID: objectID}}),
// 		objectID: objectID,
// 	};
// }

// // export function addSelection(selection) {
// // 	return {
// // 		type: ADD_SELECTION,
// // 		selection: selection,
// // 	};
// // }

// export function discussionVoteSubmit(type, discussionID, userYay, userNay) {
// 	return {
// 		types: [DISCUSSION_VOTE, DISCUSSION_VOTE_SUCCESS, DISCUSSION_VOTE_FAIL],
// 		promise: (client) => client.post('/voteDiscussion', {data: {type, discussionID, userYay, userNay}}),
// 		voteType: type,
// 		discussionID: discussionID,
// 		userYay: userYay,
// 		userNay: userNay,
// 	};
// }
