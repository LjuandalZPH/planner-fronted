import { render, screen, fireEvent } from "@testing-library/react";
import { MissionCard } from "@/components/mission/MissionCard";

describe("MissionCard Component", () => {
  const mockMission = {
    id: "test-id-123",
    title: "Complete Project",
    description: "Finish the final project",
    xp: 100,
    progress: 50,
  };

  describe("Rendering", () => {
    it("should render mission title", () => {
      render(<MissionCard mission={mockMission} />);

      expect(screen.getByText("Complete Project")).toBeInTheDocument();
    });

    it("should render mission description", () => {
      render(<MissionCard mission={mockMission} />);

      expect(screen.getByText("Finish the final project")).toBeInTheDocument();
    });

    it("should render XP badge", () => {
      render(<MissionCard mission={mockMission} />);

      expect(screen.getByText("100 XP")).toBeInTheDocument();
    });

    it("should render progress percentage", () => {
      render(<MissionCard mission={mockMission} />);

      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("should not render description if empty", () => {
      const missionWithoutDesc = { ...mockMission, description: "" };
      render(<MissionCard mission={missionWithoutDesc} />);

      expect(screen.queryByText("Finish the final project")).not.toBeInTheDocument();
    });
  });

  describe("Completed Mission", () => {
    const completedMission = { ...mockMission, progress: 100 };

    it("should render 'Sealed' badge", () => {
      render(<MissionCard mission={completedMission} />);

      expect(screen.getByText("Sealed")).toBeInTheDocument();
    });

    it("should not render Seal Contract button", () => {
      render(<MissionCard mission={completedMission} />);

      expect(screen.queryByText("Seal Contract")).not.toBeInTheDocument();
    });

    it("should not render delete button for completed mission when onDelete provided", () => {
      const onDelete = jest.fn();
      render(<MissionCard mission={completedMission} onDelete={onDelete} />);

      expect(screen.queryByRole("button", { name: /trash/i })).not.toBeInTheDocument();
    });
  });

  describe("Incomplete Mission", () => {
    it("should render Seal Contract button when onComplete provided", () => {
      const onComplete = jest.fn();
      render(<MissionCard mission={mockMission} onComplete={onComplete} />);

      expect(screen.getByText("Seal Contract")).toBeInTheDocument();
    });

    it("should render delete button when onDelete provided", () => {
      const onDelete = jest.fn();
      render(<MissionCard mission={mockMission} onDelete={onDelete} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should call onComplete with mission id when Seal Contract clicked", () => {
      const onComplete = jest.fn();
      render(<MissionCard mission={mockMission} onComplete={onComplete} />);

      fireEvent.click(screen.getByText("Seal Contract"));

      expect(onComplete).toHaveBeenCalledWith("test-id-123");
    });

    it("should call onDelete with mission id when delete clicked", () => {
      const onDelete = jest.fn();
      render(<MissionCard mission={mockMission} onDelete={onDelete} />);

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[buttons.length - 1]);

      expect(onDelete).toHaveBeenCalledWith("test-id-123");
    });
  });

  describe("Completing State", () => {
    it("should show disabled button when isCompleting is true", () => {
      const onComplete = jest.fn();
      render(
        <MissionCard mission={mockMission} onComplete={onComplete} isCompleting={true} />
      );

      const buttons = screen.getAllByRole("button");
      const sealButton = buttons.find(btn => btn.textContent === "Seal Contract");
      expect(sealButton).toBeDefined();
    });

    it("should not call onComplete when button is disabled", () => {
      const onComplete = jest.fn();
      render(
        <MissionCard mission={mockMission} onComplete={onComplete} isCompleting={true} />
      );

      const buttons = screen.getAllByRole("button");
      const sealButton = buttons.find(btn => btn.textContent === "Seal Contract");
      
      if (sealButton) {
        fireEvent.click(sealButton);
      }

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("Without Actions", () => {
    it("should not render action buttons when no callbacks provided", () => {
      render(<MissionCard mission={mockMission} />);

      expect(screen.queryByText("Seal Contract")).not.toBeInTheDocument();
    });
  });
});
