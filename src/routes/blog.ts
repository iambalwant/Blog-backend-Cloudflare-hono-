import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify, decode } from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings:{
      DATABASE_URL: string,
      JWT_SECRET: string,
    },
    Variables:{
        userId:string
    }
  }>();


  //this is an middle ware this is how saddly we define 😚
  blogRouter.use('/*', async (c, next) => {
  
    const header = c.req.header("authorization") || "";
    const response = await verify(header, c.env.JWT_SECRET);
    if(response){
        //@ts-ignore
        c.set("userId", response.id)
      await next()
    }else{
      c.status(403);
      return c.json({
        msg:"not auth and jwt token"
      })
    }
  })

  
 blogRouter.post('/', async (c) => {

    const body = await c.req.json()
    const userId = c.get("userId")
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
   
    const blog = await prisma.post.create({
       data:{
         title:body.title,
         content: body.content,
         authorId: userId
       }
    })
 return c.json({
    id: blog.id
 })
  })
  
  blogRouter.put('/', async (c) => {
    const body = await c.req.json()

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
   
    const blog = await prisma.post.update({
       where:{
          id: body.id
       },
        data:{
         title:body.title,
         content: body.content,
       }
    })
 return c.json({
    id: blog.id
 })
  })
  
  //add pagination

  blogRouter.get('/bulk', async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
    
      const blog = await prisma.post.findMany();

      return c.json({
        blog
      })

  })

  blogRouter.get('/:id', async (c) => {
    const body = c.req.param("id")

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    try {
        const blog = await prisma.post.findFirst({
           where:{
              id: body
           }
        })

        return c.json({
           id: blog
        })
    } catch (error) {
        c.status(411)
        return c.json({
           msg:"error in fetching the data"
        })
    }
    
  })

