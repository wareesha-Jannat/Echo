"use server";

import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation";
import crypto from "crypto";
import { addMinutes } from "date-fns";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function HandleForgotPassword(
  values: ForgotPasswordValues,
): Promise<{ error: string } | { success: boolean }> {
  try {
    const { email } = forgotPasswordSchema.parse(values);
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return {
        error: "User not found",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = addMinutes(new Date(), 15);

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    const { error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "wjannat309@gmail.com",
      subject: "Reset your Password",
      html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link is valid for 15 minutes.</p>`,
    });

    if (error) {
      return { error: "Failed to send email. Try again later." };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: "Something went wrong. Please try again",
    };
  }
}
