export const MAX_SKILLS = 15;
export const MIN_SKILL_LENGTH = 2;
export const MAX_SKILL_LENGTH = 40;

export function parseSkillList(value?: string | string[] | null): string[] {
  const parts = Array.isArray(value)
    ? value
    : String(value ?? "").split(/[,|\n]/);

  const seen = new Set<string>();
  const skills: string[] = [];

  for (const part of parts) {
    const skill = part.trim().replace(/\s+/g, " ");
    if (!skill) continue;

    const key = skill.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    skills.push(skill);
  }

  return skills;
}

export function serializeSkillList(skills?: string[] | null): string {
  return (skills ?? []).join(", ");
}
