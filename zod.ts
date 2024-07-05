import z from 'zod';

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
    name: z.string().optional()
})


export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
})


export const blogInput = z.object({
    title: z.string().max(20),
    content: z.string().max(300),
})


export const updateBlogInput = z.object({
    title: z.string().max(20),
    content: z.string().max(300),
    id: z.string(),
})

export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type BlogInput = z.infer<typeof blogInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>