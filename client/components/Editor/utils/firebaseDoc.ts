import { Node, Schema } from 'prosemirror-model';
import { Step } from 'prosemirror-transform';
import { uncompressStateJSON, uncompressStepJSON } from 'prosemirror-compress-pubpub';
import firebase from 'firebase';

import { getEmptyDoc } from './doc';
import { flattenKeyables } from './firebase';

type Reference = firebase.database.Reference;
type Query = firebase.database.Query;

type CheckpointMap = Record<string, number>;

type ChooseKey = (keys: number[]) => number;
type TraverseQuery = (query: Query) => Query;

const getMostRecentDocJson = async (
	firebaseRef: Reference,
	checkpointMap: null | CheckpointMap,
	versionNumber: null | number = null,
) => {
	// First see whether we have a checkpointMap -- this should indicate that there is one
	// or more checkpoint available in the `checkpoints` child.
	if (checkpointMap) {
		// We're interested in the keys of this object, which are strings. Cast them to numbers.
		const checkpointKeys = Object.keys(checkpointMap).map((key) => parseInt(key, 10));
		// Find the highest key less than or equal to versionNumber, and get that doc.
		// If there's no version number, we take the highest key.
		const bestKey = checkpointKeys
			.filter((key) => typeof versionNumber !== 'number' || key <= versionNumber)
			.reduce((a, b) => Math.max(a, b), -1);
		if (bestKey >= 0) {
			const checkpointSnapshot = await firebaseRef
				.child(`checkpoints/${bestKey}`)
				.once('value');
			const checkpoint = checkpointSnapshot.val();
			if (checkpoint) {
				const { doc } = uncompressStateJSON(checkpoint);
				return { doc, key: bestKey, timestamp: checkpoint.t };
			}
		}
	}
	// Okay, no luck with the checkpointMap. Maybe there is something in the `checkpoint` key?
	// We are deprecating this (Ian, 03/2020) and ought to remove it shortly after.
	const checkpointSnapshot = await firebaseRef.child('checkpoint').once('value');
	const checkpoint = checkpointSnapshot.val();
	if (checkpoint) {
		const { k: keyString } = checkpoint;
		const key = parseInt(keyString, 10);
		if (typeof versionNumber !== 'number' || key <= versionNumber) {
			const { doc } = uncompressStateJSON(checkpoint);
			return { doc, key };
		}
	}
	// There's no checkpoint, so let's just return an empty doc.
	return {
		doc: getEmptyDoc(),
		key: -1,
	};
};

const ordinalKeyTimestampGetter =
	(traverseQuery: TraverseQuery, chooseKey: ChooseKey) => async (firebaseRef: Reference) => {
		const getLatestChange = traverseQuery(firebaseRef.child('changes').orderByKey()).once(
			'value',
		);
		const getLatestMerge = traverseQuery(firebaseRef.child('merges').orderByKey()).once(
			'value',
		);

		const [latestChangeSnaphot, latestMergeSnapshot] = await Promise.all([
			getLatestChange,
			getLatestMerge,
		]);

		const latestUpdates = {
			...latestChangeSnaphot.val(),
			...latestMergeSnapshot.val(),
		};

		const allKeys = Object.keys(latestUpdates).map((key) => parseInt(key, 10));
		const bestKey = chooseKey(allKeys);

		const updateWrapped = latestUpdates[bestKey];
		const update = Array.isArray(updateWrapped)
			? updateWrapped[updateWrapped.length - 1]
			: updateWrapped;
		const timestamp = update && update.t;

		return { key: bestKey, timestamp };
	};

export const getFirstKeyAndTimestamp = ordinalKeyTimestampGetter(
	(ref) => ref.limitToFirst(1),
	(keys) => (keys.length ? keys.reduce((a, b) => Math.min(a, b), Infinity) : -1),
);

export const getLatestKeyAndTimestamp = ordinalKeyTimestampGetter(
	(ref) => ref.limitToLast(1),
	(keys) => (keys.length ? keys.reduce((a, b) => Math.max(a, b), -Infinity) : -1),
);

const getStepsJsonFromChanges = (changes) => {
	return changes
		.map((change) => {
			const { s: compressedStepsJson } = change;
			return compressedStepsJson.map(uncompressStepJSON);
		})
		.reduce((a, b) => [...a, ...b], []);
};

export const getFirebaseDoc = async (
	firebaseRef: Reference,
	prosemirrorSchema: Schema,
	versionNumber: number | null = null,
) => {
	const checkpointMapSnapshot = await firebaseRef.child('checkpointMap').once('value');
	const checkpointMap = checkpointMapSnapshot.val();

	const {
		doc: checkpointDocJson,
		key: checkpointKey,
		timestamp: checkpointTimestamp,
	} = await getMostRecentDocJson(firebaseRef, checkpointMap, versionNumber);

	const getChanges = firebaseRef
		.child('changes')
		.orderByKey()
		.startAt(String(checkpointKey + 1))
		.endAt(String(versionNumber))
		.once('value');

	const getMerges = firebaseRef
		.child('merges')
		.orderByKey()
		.startAt(String(checkpointKey + 1))
		.endAt(String(versionNumber))
		.once('value');

	const [changesSnapshot, mergesSnapshot] = await Promise.all([getChanges, getMerges]);

	const allKeyables = {
		...changesSnapshot.val(),
		...mergesSnapshot.val(),
	};

	const flattenedChanges = flattenKeyables(allKeyables);
	const stepsJson = getStepsJsonFromChanges(flattenedChanges);

	const keys = Object.keys(allKeyables);
	const currentKey = keys.length
		? keys.map((key) => parseInt(key, 10)).reduce((a, b) => Math.max(a, b))
		: checkpointKey;

	const currentTimestamp =
		flattenedChanges.length > 0
			? flattenedChanges[flattenedChanges.length - 1].t
			: checkpointTimestamp;

	const currentDoc: Node = stepsJson.reduce((intermediateDoc: Node, stepJson: any) => {
		const step = Step.fromJSON(prosemirrorSchema, stepJson);
		const { failed, doc } = step.apply(intermediateDoc);
		if (failed) {
			console.error(`Failed with: ${failed}`);
		}
		return doc;
	}, Node.fromJSON(prosemirrorSchema, checkpointDocJson));

	return {
		doc: currentDoc,
		docIsFromCheckpoint: stepsJson.length === 0,
		key: currentKey,
		timestamp: currentTimestamp,
		checkpointMap,
	};
};
