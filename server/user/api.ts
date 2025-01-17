import passport from 'passport';

import app, { wrap } from 'server/server';
import { ForbiddenError, NotFoundError } from 'server/utils/errors';

import { getPermissions } from './permissions';
import { createUser, updateUser, getUserAvatarInfo } from './queries';

const getRequestIds = (req) => {
	const user = req.user || {};
	return {
		userId: user.id,
		submittedUserId: req.body.userId,
		email: req.body.email ? req.body.email.toLowerCase().trim() : null,
		hash: req.body.hash || null,
	};
};

app.post('/api/users', (req, res) => {
	const requestIds = getRequestIds(req);
	getPermissions(requestIds)
		.then((permissions) => {
			if (!permissions.create) {
				throw new Error('Not Authorized');
			}
			return createUser(req.body);
		})
		.then((newUser) => {
			passport.authenticate('local')(req, res, () => {
				return res.status(201).json(newUser);
			});
		})
		.catch((err) => {
			console.error('Error in postUser: ', err);
			return res.status(500).json(err.message);
		});
});

app.get(
	'/api/users',
	wrap(async (req, res) => {
		const requestIds = getRequestIds(req);
		const permissions = await getPermissions(requestIds);
		if (!permissions.read) {
			throw new ForbiddenError();
		}
		const userInfo = await getUserAvatarInfo(req.body);
		if (userInfo) {
			return res.status(201).json(userInfo);
		}

		throw new NotFoundError();
	}),
);

app.put('/api/users', (req, res) => {
	getPermissions(getRequestIds(req))
		.then((permissions) => {
			if (!permissions.update) {
				throw new Error('Not Authorized');
			}
			return updateUser(req.body, permissions.update, req);
		})
		.then((updatedValues) => {
			return res.status(201).json(updatedValues);
		})
		.catch((err) => {
			console.error('Error in putUser: ', err);
			return res.status(500).json(err.message);
		});
});
