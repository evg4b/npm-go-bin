export const assertIn = <T = any>(value: string, definition: Record<string, T>, message?: string) => {
  if (!(value in definition)) {
    throw new Error(message ?? `Value ${ JSON.stringify(value) } is not allowed.`);
  }
};

export const assertIsDefined = <T = any>(value: T, message?: string) => {
  if (value === null || typeof value === 'undefined') {
    throw new Error(message ?? 'Value should be defined');
  }
};
