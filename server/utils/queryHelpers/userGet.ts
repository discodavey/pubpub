import { Pub, PubAttribution, User } from 'server/models';

import buildPubOptions from './pubOptions';
import sanitizePub from './pubSanitize';

export default async (slug, initialData) => {
	const sanitizedSlug = slug.toLowerCase();
	let userData = await User.findOne({
		where: {
			slug: sanitizedSlug,
		},
		attributes: {
			exclude: ['salt', 'hash', 'email', 'updatedAt'],
		},
		include: [
			{
				model: PubAttribution,
				as: 'attributions',
				required: false,
				include: [
					{
						model: Pub,
						as: 'pub',
						// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ isPreview: boolean; getMembers... Remove this comment to see the full error message
						...buildPubOptions({
							isPreview: true,
							getMembers: true,
							getCommunity: true,
							getCollections: true,
						}),
					},
				],
			},
		],
	});

	if (!userData) {
		throw new Error('User Not Found');
	}

	userData = userData.toJSON();
	userData.attributions = (userData.attributions || [])
		.map((attribution) => {
			// @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
			const sanitizedPub = sanitizePub(attribution.pub, initialData);
			return {
				...attribution,
				pub: sanitizedPub,
			};
		})
		.filter((attribution) => {
			return !!attribution.pub;
		});

	return userData;
};