import { TypeOf, ZodSchema } from 'zod';

import { PostgresDatatype } from './database';

type AnyExtension = Record<string, any>;

type FacetPropTypeOptions<
	Schema extends ZodSchema = ZodSchema,
	Extension extends AnyExtension = AnyExtension,
> = {
	name?: string;
	identity?: any;
	schema: Schema;
	postgresType: PostgresDatatype;
	extension: Extension;
};

export type FacetPropType<
	Schema extends ZodSchema = ZodSchema,
	Extension = AnyExtension,
> = FacetPropTypeOptions<Schema, Extension> & {
	__facetPropType: true;
};

export type TypeOfPropType<PropType extends FacetPropType> = TypeOf<PropType['schema']>;

export type NullableTypeOfPropType<PropType extends FacetPropType> =
	null | TypeOfPropType<PropType>;

export const propType = <Schema extends ZodSchema, Extension extends AnyExtension>(
	options: FacetPropTypeOptions<Schema, Extension>,
): FacetPropType<Schema, Extension> => {
	return { ...options, __facetPropType: true };
};
