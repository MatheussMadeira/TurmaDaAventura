import 'server-only';
import { teamSchema } from '@/content/adminSchemas';
import { DomainError } from '../actions';
import type { SessionUser } from '../auth/session';
import { db } from '../db';
import { audit, parseInput, reorder, touchSite } from './shared';

export async function listTeam() {
  const rows = await db.teamMember.findMany({
    include: { photo: true },
    orderBy: { order: 'asc' },
  });
  return rows.map((m) => ({
    id: m.id,
    nickname: m.nickname,
    name: m.name,
    role: m.role,
    badges: m.badges,
    visible: m.visible,
    photoUrl: m.photo?.url ?? null,
  }));
}
export type TeamRow = Awaited<ReturnType<typeof listTeam>>[number];

export const getMember = (id: string) =>
  db.teamMember.findUnique({ where: { id }, include: { photo: true } });

export async function saveMember(actor: SessionUser, id: string | null, rawInput: unknown) {
  const input = parseInput(teamSchema, rawInput);
  if (input.photoId && !(await db.media.findUnique({ where: { id: input.photoId } }))) {
    throw new DomainError('Revise 1 campo.', { photoId: 'Foto não encontrada na biblioteca.' });
  }
  const data = {
    nickname: input.nickname,
    name: input.name,
    role: input.role,
    bio: input.bio,
    badges: input.badges,
    photoId: input.photoId,
    visible: input.visible,
  };
  let saved;
  if (id) {
    if (!(await db.teamMember.findUnique({ where: { id } })))
      throw new DomainError('Pessoa não encontrada.');
    saved = await db.teamMember.update({ where: { id }, data });
  } else {
    saved = await db.teamMember.create({ data: { ...data, order: await db.teamMember.count() } });
  }
  await audit(
    actor,
    'team',
    id ? 'team.update' : 'team.create',
    saved.id,
    `${id ? 'Editou' : 'Adicionou'} ${saved.name} na equipe`,
    saved.visible,
  );
  touchSite();
  return saved;
}

export async function setMemberVisible(actor: SessionUser, id: string, visible: boolean) {
  const m = await db.teamMember.update({ where: { id }, data: { visible } }).catch(() => null);
  if (!m) throw new DomainError('Pessoa não encontrada.');
  await audit(
    actor,
    'team',
    'team.visible',
    id,
    `${visible ? 'Mostrou' : 'Ocultou'} ${m.name} no site`,
    true,
  );
  touchSite();
}

export async function deleteMember(actor: SessionUser, id: string) {
  const m = await db.teamMember.findUnique({ where: { id } });
  if (!m) throw new DomainError('Pessoa não encontrada.');
  await db.teamMember.delete({ where: { id } });
  await audit(actor, 'team', 'team.delete', id, `Removeu ${m.name} da equipe`, true);
  touchSite();
}

export async function moveMember(actor: SessionUser, id: string, dir: 'up' | 'down') {
  const m = await db.teamMember.findUnique({ where: { id } });
  if (!m) throw new DomainError('Pessoa não encontrada.');
  const siblings = await db.teamMember.findMany({
    orderBy: { order: 'asc' },
    select: { id: true },
  });
  const moved = await reorder(siblings, id, dir, (ids) =>
    db.$transaction(
      ids.map((rid, order) => db.teamMember.update({ where: { id: rid }, data: { order } })),
    ),
  );
  if (moved) {
    await audit(actor, 'team', 'team.move', id, `Mudou a ordem de ${m.name}`, true);
    touchSite();
  }
  return moved;
}
