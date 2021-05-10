export default (sequelize, dataTypes) => {
	return sequelize.define('ActivityItem', {
		id: sequelize.idType,
		kind: { type: dataTypes.TEXT, allowNull: false },
		pubId: { type: dataTypes.UUID },
		payload: { type: dataTypes.JSONB },
		communityId: { type: dataTypes.UUID, allowNull: false },
		actorId: { type: dataTypes.UUID, allowNull: false },
		collectionId: { type: dataTypes.UUID },
	});
};