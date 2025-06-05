import EventList from "@/components/EventList";
import Image from "next/image";
import AIChat from "@/components/AIChat";

export default function Home() {
  return (
    <div>
      <EventList />
      <AIChat mode="buyer" />
    </div>
  );
}
