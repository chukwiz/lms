import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, {params: {courseId, id}} : {params: {courseId: string, id:string}}) {
try {
    const {userId} = auth()

    if(!userId) {
        return new NextResponse("Unauthorized", {status: 401})
    }

    const attachment = await db.attachment.delete({
        where: {
            courseId,
            id
        }
    })

    return NextResponse.json(attachment)
} catch (error) {
    console.log("ATTACHMENT_ID", error)
    return new NextResponse("Internal Server Error", {status: 401})

}
}