export default (sequelize, dataTypes) => {
	return sequelize.define(
		'facetBinding',
		{
			id: sequelize.idType,
			pubId: { type: dataTypes.UUID, allowNull: true },
			collectionId: { type: dataTypes.UUID, allowNull: true },
			communityId: { type: dataTypes.UUID, allowNull: true },
		},
		{
			tableName: 'FacetBindings',
			indexes: [
				{ fields: ['communityId'], method: 'BTREE' },
				{ fields: ['collectionId'], method: 'BTREE' },
				{ fields: ['pubId'], method: 'BTREE' },
			],
		},
	);
};
