import { UploadForm } from "./UploadForm";

export default function UploadPage({ params }: { params: { sessionId: string } }) {
  return (
    <main className="min-h-screen bg-arena-bg flex items-center justify-center px-4 py-10">
      <UploadForm sessionId={params.sessionId} />
    </main>
  );
}
