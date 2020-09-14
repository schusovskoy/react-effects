type HasPropertyGuard = <P extends PrimitiveLiteral<P>>(
  prop: P,
  obj: unknown,
) => obj is Record<P, unknown>

export const hasProperty = ((prop, obj) =>
  typeof obj === 'object' &&
  obj !== null &&
  obj.hasOwnProperty(prop)) as HasPropertyGuard

type PropEqualsGuard = <P extends PrimitiveLiteral<P>>(
  prop: P,
) => <V>(
  value: V,
) => <T extends { [K in P]: V }>() => (obj: unknown) => obj is T

export const propEquals = (prop => value => () => obj => {
  if (hasProperty(prop, obj)) return obj[prop] === value
  return false
}) as PropEqualsGuard

export const tagEquals = propEquals('_tag')
