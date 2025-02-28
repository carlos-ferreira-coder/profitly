import { prisma } from '@/server'

export const authorization = async (
  type: 'admin' | 'project' | 'personal' | 'financial',
  uuid: string,
): Promise<boolean> => {
  const auth = await prisma.auth.findUnique({ where: { uuid: uuid } })

  if (!auth) return false

  switch (type) {
    case 'admin':
      return auth.admin || false
    case 'project':
      return auth.project || false
    case 'personal':
      return auth.personal || false
    case 'financial':
      return auth.financial || false
    default:
      return false
  }
}

export const getToken = async () => {}
