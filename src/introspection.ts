/**
 * Standard GraphQL introspection query. The shape mirrors what `graphql-js`
 * emits from `getIntrospectionQuery({ descriptions: true })` — but as a static
 * string so we don't pull `graphql` into the runtime bundle.
 */
export const INTROSPECTION_QUERY = /* GraphQL */ `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types { ...FullType }
      directives {
        name
        description
        locations
        args { ...InputValue }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args { ...InputValue }
      type { ...TypeRef }
      isDeprecated
      deprecationReason
    }
    inputFields { ...InputValue }
    interfaces { ...TypeRef }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes { ...TypeRef }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType { kind name }
              }
            }
          }
        }
      }
    }
  }
`;

/** A simplified, hand-written introspection result type. */
export interface IntrospectionResult {
  readonly __schema: {
    readonly queryType: { readonly name: string };
    readonly mutationType?: { readonly name: string } | null;
    readonly subscriptionType?: { readonly name: string } | null;
    readonly types: ReadonlyArray<IntrospectionType>;
    readonly directives: ReadonlyArray<IntrospectionDirective>;
  };
}

export interface IntrospectionType {
  readonly kind: string;
  readonly name: string | null;
  readonly description?: string | null;
  readonly fields?: ReadonlyArray<IntrospectionField> | null;
  readonly inputFields?: ReadonlyArray<IntrospectionInputValue> | null;
  readonly interfaces?: ReadonlyArray<IntrospectionTypeRef> | null;
  readonly enumValues?: ReadonlyArray<IntrospectionEnumValue> | null;
  readonly possibleTypes?: ReadonlyArray<IntrospectionTypeRef> | null;
}

export interface IntrospectionField {
  readonly name: string;
  readonly description?: string | null;
  readonly args: ReadonlyArray<IntrospectionInputValue>;
  readonly type: IntrospectionTypeRef;
  readonly isDeprecated: boolean;
  readonly deprecationReason?: string | null;
}

export interface IntrospectionInputValue {
  readonly name: string;
  readonly description?: string | null;
  readonly type: IntrospectionTypeRef;
  readonly defaultValue?: string | null;
}

export interface IntrospectionEnumValue {
  readonly name: string;
  readonly description?: string | null;
  readonly isDeprecated: boolean;
  readonly deprecationReason?: string | null;
}

export interface IntrospectionTypeRef {
  readonly kind: string;
  readonly name: string | null;
  readonly ofType?: IntrospectionTypeRef | null;
}

export interface IntrospectionDirective {
  readonly name: string;
  readonly description?: string | null;
  readonly locations: ReadonlyArray<string>;
  readonly args: ReadonlyArray<IntrospectionInputValue>;
}
