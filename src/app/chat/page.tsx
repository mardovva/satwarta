import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import PageBackground from "@/components/layout/PageBackground";
import ChatView from "@/components/chat/ChatView";

export const metadata: Metadata = {
  title: "AI Chat | Satwarta",
  description: "Panduan pertolongan pertama satwa terdampak sambil menunggu petugas.",
};

export default function ChatPage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-x-clip">
        <PageBackground burnt>
          <section className="px-4 pb-8 pt-24 sm:pt-28">
            <ChatView />
          </section>
        </PageBackground>
      </main>
    </>
  );
}
