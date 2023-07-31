import type { NextApiRequest, NextApiResponse } from 'next';
import { roqClient } from 'server/roq';
import { prisma } from 'server/db';
import { errorHandlerMiddleware } from 'server/middlewares';
import { knowledgeValidationSchema } from 'validationSchema/knowledges';
import { HttpMethod, convertMethodToOperation, convertQueryToPrismaUtil } from 'server/utils';
import { getServerSession } from '@roq/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roqUserId, user } = await getServerSession(req);
  await prisma.knowledge
    .withAuthorization({
      roqUserId,
      tenantId: user.tenantId,
      roles: user.roles,
    })
    .hasAccess(req.query.id as string, convertMethodToOperation(req.method as HttpMethod));

  switch (req.method) {
    case 'GET':
      return getKnowledgeById();
    case 'PUT':
      return updateKnowledgeById();
    case 'DELETE':
      return deleteKnowledgeById();
    default:
      return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  async function getKnowledgeById() {
    const data = await prisma.knowledge.findFirst(convertQueryToPrismaUtil(req.query, 'knowledge'));
    return res.status(200).json(data);
  }

  async function updateKnowledgeById() {
    await knowledgeValidationSchema.validate(req.body);
    const data = await prisma.knowledge.update({
      where: { id: req.query.id as string },
      data: {
        ...req.body,
      },
    });

    return res.status(200).json(data);
  }
  async function deleteKnowledgeById() {
    const data = await prisma.knowledge.delete({
      where: { id: req.query.id as string },
    });
    return res.status(200).json(data);
  }
}

export default function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  return errorHandlerMiddleware(handler)(req, res);
}
