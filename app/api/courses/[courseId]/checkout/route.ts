import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    try {
        const user = await currentUser()

        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                isPublished: true
            }
        })

        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: params.courseId
                }
            }
        })

        if (purchase) {
            return new NextResponse("Already purchased", { status: 400 })
        }

        if (!course) {
            return new NextResponse("Not Found", { status: 404 })
        }

        let paystackCustomer = await db.paystackCustomer.findUnique({
            where: {
                userId: user.id
            },

            select: {
                paystackCustomerId: true
            }
        })

        if (!paystackCustomer) {
            const customer = await axios.post("https://api.paystack.co/customer", {
                email: user.emailAddresses[0].emailAddress,
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            })

            paystackCustomer = await db.paystackCustomer.create({
                data: {
                    userId: user.id,
                    paystackCustomerId: customer.data.data.customer_code
                }
            })
        }

        const items = {
            email: user.emailAddresses[0].emailAddress,
            amount: Math.round(course.price! * 100),
            metadata: {
                courseId: course.id,
                userId: user.id,
                cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}`
            }
        }

        const response = await axios.post("https://api.paystack.co/transaction/initialize", items, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json"
            }
        })
        return NextResponse.json({ url: response.data.data.authorization_url })
    } catch (error) {
        console.log("CHECKOUT ERROR", error)
        return new NextResponse("Something went wrong", { status: 500 })
    }
}