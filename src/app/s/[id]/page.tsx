import { Suspense } from "react";
import { SessionFlow } from "@/components/session-flow";

async function Flow({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionFlow id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Flow params={params} />
    </Suspense>
  );
}
