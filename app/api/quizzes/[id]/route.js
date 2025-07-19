// File: app/api/quizzes/[id]/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getClient } from "@/lib/db"  // Assuming you're using this to connect to your DB

export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || "your-secret-key")
    if (decoded.role !== "teacher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const quizId = params.id
    const client = await getClient()

    try {
      await client.query("BEGIN")
      await client.query("DELETE FROM questions WHERE quiz_id = $1", [quizId])
      await client.query("DELETE FROM quizzes WHERE id = $1 AND teacher_id = $2", [quizId, decoded.userId])
      await client.query("COMMIT")
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("Error deleting quiz:", error)
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 })
  }
}
