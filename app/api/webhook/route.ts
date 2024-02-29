import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    let data
    try {
        data = await req.json()
    } catch (error: any) {
        console.log(error)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const courseId = data.data.metadata.courseId
    const userId = data.data.metadata.userId

    if (data && data.event === "charge.success") {
        if (!courseId || !userId) {
            return new NextResponse("Webhook Error: Missing Metadata", { status: 500 })
        }

        await db.purchase.create({
            data: {
                courseId,
                userId
            }
        })
    } else {
        return new NextResponse(`Webhook Error: Unhandled event type`, { status: 200 })
    }
    return new NextResponse(null, { status: 200 })
}