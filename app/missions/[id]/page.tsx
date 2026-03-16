interface MissionDetailPageProps {
  params: { id: string };
}

export default function MissionDetailPage({ params }: MissionDetailPageProps) {
  return (
    <main>
      <h1>Detalle de misión</h1>
      <p>ID de misión: {params.id}</p>
    </main>
  );
}

