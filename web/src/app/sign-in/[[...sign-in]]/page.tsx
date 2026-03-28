import { SignIn } from "@clerk/nextjs";
import { Header } from "@/components/shared/Header";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <SignIn />
      </div>
    </div>
  );
}
