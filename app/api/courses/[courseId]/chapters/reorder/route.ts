import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params: { courseId } }: { params: { courseId: string } }) {
    try {
        const { userId } = auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const { list } = await req.json()

        const ownedCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId
            }
        })

        if (!ownedCourse) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        for (let item of list) {
            await db.chapter.update({
                where: {
                    id: item.id
                },
                data: {
                    position: item.position
                }
            })
        }

        return new NextResponse("Success", { status: 201 })
    } catch (error) {
        console.error("[REORDER]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}