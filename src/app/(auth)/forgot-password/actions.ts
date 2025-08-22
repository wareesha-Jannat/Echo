"use server"

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation";
import { randomBytes } from "crypto";
import { addMinutes } from "date-fns";
import nodemailer from "nodemailer"


export async function HandleForgotPassword(values : ForgotPasswordValues): Promise<{error : string} | {success : boolean}> {
  try {
     const {email} = forgotPasswordSchema.parse(values)
        const user =  await prisma.user.findUnique({
            where : {
                email,
            }
        })
        if(!user){
            return {
                error : "User not found"
            }
        }

        const token = randomBytes(32).toString('hex')
        const expiresAt  = addMinutes(new Date() , 15)

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt
            }
        })

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

        const transporter = nodemailer.createTransport({
            service : "gmail",
            auth : {
                user :process.env.EMAIL_USER,
                pass : process.env.EMAIL_PASS
            }
        })

        await transporter.sendMail({
            from : process.env.EMAIL_USER,
            to : email,
            subject : "Reset your Password",
            html  :`<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link is valid for 15 minutes.</p>`,

        })

        return {
            success : true
        }
  } catch (error) {
    return {
        error : "Something went wrong. Please try again"
    }
  }

       


   
}