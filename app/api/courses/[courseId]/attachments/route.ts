import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(req:Request, {params: {courseId}}: {params: {courseId: string}}) {

    try {
        const {userId} = auth()
        const {url} = await req.json()

        if(!userId) {
            return new NextResponse("Unauthorized", {status: 401})
        }

        const courseOwner = db.course.findUnique({
            where: {
                id: courseId,
                userId
            }
        })

        if(!courseOwner) {
            return new NextResponse("Unauthorized", {status:401})
        }

        const attachement = await db.attachment.create({
            data: {
                url,
                name: url.split("/").pop(),
                courseId
            }
        })

        return NextResponse.json(attachement)
    } catch (error) {
        console.log("COURSE_ID ATTACHEMENTS", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}