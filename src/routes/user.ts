import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify, decode } from "hono/jwt";
import { signinInput, signupInput } from "../../zod";

export const userRouter = new Hono<{
  Bindings:{
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();




userRouter.post('/signup', async(c) => {
  
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const body = await c.req.json();
    const {success} = signupInput.safeParse(body)
    if(!success){
        c.status(411)
        return c.json({
            msg:"Input are wrong"
        })
    }
    try {
     const user = await prisma.user.create({
        data:{
          email: body.email,
          password: body.password,
          name:body.name,
        },
      })
  
      const token = await sign({
        id: user.id
      }, c.env.JWT_SECRET )
  
     return c.json({ 
       jwt: token
     })
    } catch (error) {
      c.status(411);
      return c.json({
        error:"error whiling signing up"
      })
    }
  })
  
  userRouter.post('/signin',  async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
    const user = await c.req.json();
    const {success} = signinInput.safeParse(user)
    if(!success){
        c.status(411)
        return c.json({
            msg:"Input are wrong"
        })
    }
    try {
      const check = await prisma.user.findUnique({
        where:{
          email:user.email,
          password:user.password
        }
      });
  
      if(!check){
        c.status(403)
        return c.json({
          msg:"this user don't exist / cred not correct"
        })
      }
  
      const jwt = await sign({
        id:check.id
      },c.env.JWT_SECRET);
      return c.json({
        jwt:jwt
      })
  
    } catch (error) {
     return c.json({
      error:"error while signup the user"
     }) 
    }
  })
  