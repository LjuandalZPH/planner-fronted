import { useState, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface MissionFormProps {
  onSubmit?: (data: {
    title: string;
    description: string;
    xp: number;
  }) => void;
}

export function MissionForm({ onSubmit }: MissionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xp, setXp] = useState(10);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit?.({
      title,
      description,
      xp,
    });
  }

  return (
    <Card title="Crear misión">
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="XP"
          value={xp}
          onChange={(e) => setXp(Number(e.target.value))}
        />
        <Button type="submit">Guardar misión</Button>
      </form>
    </Card>
  );
}

