import { NextResponse } from "next/server";
import { sendOtpEmail } from "@/lib/mailer";

export async function GET(req: Request) {
  try {
    // We will send the test email to whichever email is acting as the sender (SMTP_USER),
    // or you can pass an email as a query parameter: /api/test-email?email=test@example.com
    const { searchParams } = new URL(req.url);
    const targetEmail = searchParams.get("email") || process.env.SMTP_USER;

    if (!targetEmail) {
      return NextResponse.json(
        { error: "No target email provided and SMTP_USER is not set." },
        { status: 400 }
      );
    }

    // Generate a secure 6-digit mock OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send the email
    const result = await sendOtpEmail(targetEmail, mockOtp, "Test User");

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email successfully sent to ${targetEmail}`,
        mockOtp,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
