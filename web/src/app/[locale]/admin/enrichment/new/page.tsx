import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { NewRunForm } from "./_components/NewRunForm"

export default async function NewRunPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "ADMIN") redirect("/")

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/admin/enrichment" className="text-on-surface-variant hover:text-on-background text-sm mb-4 inline-block">← Back to runs</Link>
          <h1 className="font-headline text-4xl font-bold text-on-background mb-1">New enrichment run</h1>
          <p className="text-on-surface-variant">Configure and trigger a new data enrichment run.</p>
        </div>
        <NewRunForm />
      </main>
      <Footer />
    </>
  )
}
