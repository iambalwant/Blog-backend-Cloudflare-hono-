import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET:string
	}
}>()

//this is an middle ware this is how saddly we define 😚
app.use('/api/v1/blog/*', async (c, next) => {
  
  const header = c.req.header("authorization") || "";
  const response = await verify(header, c.env.JWT_SECRET)
  if(response.id){
     next()
  }else{
    c.status(403);
    return c.json({
      msg:"not auth and jwt token"
    })
  }
})

app.post('/api/v1/signup', async(c) => {
  
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const body = await c.req.json();
  
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

app.post('/api/v1/signin',  async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const user = await c.req.json();

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

app.post('/api/v1/blog', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  return c.text('Hello Hono!')
})

app.put('/api/v1/blog', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  return c.text('Hello Hono!')
})

app.get('/api/v1/blog/:id', (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  return c.text('Hello Hono!')
})

export default app
