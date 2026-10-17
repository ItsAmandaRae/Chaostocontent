export function addVoiceTrait(traits: string[], input: string): string[] {
  const trait = input.trim().slice(0, 80);
  return !trait || traits.some((v) => v.toLowerCase() === trait.toLowerCase()) ? traits : [...traits, trait];
}