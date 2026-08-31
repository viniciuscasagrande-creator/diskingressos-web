import { PrismaClient } from '@prisma/client';
const prisma=new PrismaClient();
try {
 const [producers,events,campaigns]=await Promise.all([prisma.producer.count(),prisma.event.count(),prisma.marketingCampaign.count()]);
 const rows=await prisma.event.findMany({select:{id:true,title:true,producerId:true},orderBy:{id:'asc'}});
 const eventRows=[]; for (const e of rows) eventRows.push({...e,campaigns:await prisma.marketingCampaign.count({where:{eventId:e.id}})});
 console.log(JSON.stringify({database:process.env.DATABASE_URL?.replace(/:[^:@/]+@/,'://***:***@'),producers,events,campaigns,eventRows},null,2));
 if(!events||!campaigns) process.exitCode=2;
} finally { await prisma.$disconnect(); }
