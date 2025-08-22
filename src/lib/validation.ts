
import { z } from 'zod'
const requiredString = z.string().trim().min(1, "Required")

export const signUpSchema = z.object({
    email : requiredString.email("Invalid email address"),
    username : requiredString.regex(
        /^[a-zA-Z0-9_-]+$/,
        "Only letters, numbers, _ and - allowed",
    ),
    password : requiredString.min(8, "Must be atleast 8 characters")

})

export type SignUpValues = z.infer<typeof signUpSchema >

export const loginSchema = z.object({
    username : requiredString,
    password : requiredString
})

export type LoginValues = z.infer<typeof loginSchema>

export const postSchema = z.object({
    content : requiredString,
    mediaIds : z.array(z.string()).max(5, "cannot have more than 5 attachments"),
    qod : z.string(),
    mood : z.string().max(30, "mood cannot exceed 30 characters").nullable().optional()
})

export const editProfileSchema = z.object({
    displayName : requiredString,
    bio: z.string().max(1000, "Cannot exceed 1000 characters")
})

export type UpdateProfileValues = z.infer<typeof editProfileSchema>

export const addCommentSchema = z.object({
    content : requiredString
})

export const forgotPasswordSchema = z.object({
    email : requiredString.email("Invalid email address"),
})

export type ForgotPasswordValues = z.infer< typeof forgotPasswordSchema>

export const passwordResetSchema = z.object({
    password: requiredString.min(8, "must be atleast 8 characters long"),
    confirmPassword : requiredString
}).refine((data)=> data.password === data.confirmPassword, {
    message : "password and confirm password must match",
    path : ["confirmPassword"]
})

export type PasswordResetValues = z.infer<typeof passwordResetSchema> 