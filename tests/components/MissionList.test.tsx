import { render, screen, fireEvent } from "@testing-library/react";
import { MissionList } from "@/components/mission/MissionList";
import type { Mission } from "@/components/mission/MissionCard";

describe("MissionList Component", () => {
  const mockMissions: Mission[] = [
    {
      id: "mission-1",
      title: "First Mission",
      description: "Description 1",
      xp: 50,
      progress: 25,
    },
    {
      id: "mission-2",
      title: "Second Mission",
      description: "Description 2",
      xp: 75,
      progress: 75,
    },
  ];

  describe("Empty State", () => {
    it("should render empty state message when no missions", () => {
      render(<MissionList missions={[]} />);

      expect(screen.getByText("No Pending Contracts")).toBeInTheDocument();
    });

    it("should render instruction text", () => {
      render(<MissionList missions={[]} />);

      expect(
        screen.getByText(/Press the "Accept New Contract" button/i)
      ).toBeInTheDocument();
    });
  });

  describe("With Missions", () => {
    it("should render all missions", () => {
      render(<MissionList missions={mockMissions} />);

      expect(screen.getByText("First Mission")).toBeInTheDocument();
      expect(screen.getByText("Second Mission")).toBeInTheDocument();
    });

    it("should pass onComplete callback to MissionCard", () => {
      const onComplete = jest.fn();
      render(<MissionList missions={mockMissions} onComplete={onComplete} />);

      const sealButtons = screen.getAllByText("Seal Contract");
      fireEvent.click(sealButtons[0]);

      expect(onComplete).toHaveBeenCalledWith("mission-1");
    });

    it("should pass onDelete callback to MissionCard", () => {
      const onDelete = jest.fn();
      render(<MissionList missions={mockMissions} onDelete={onDelete} />);

      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(btn => !btn.textContent?.includes("Seal"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }

      expect(onDelete).toHaveBeenCalled();
    });

    it("should pass completingId to the correct MissionCard", () => {
      const onComplete = jest.fn();
      render(
        <MissionList
          missions={mockMissions}
          onComplete={onComplete}
          completingId="mission-2"
        />
      );

      const mission2Card = screen.getByText("Second Mission").closest("article");
      const sealButton = mission2Card?.querySelector("button");
      expect(sealButton).toBeDisabled();
    });
  });

  describe("Single Mission", () => {
    it("should render single mission correctly", () => {
      render(<MissionList missions={[mockMissions[0]]} />);

      expect(screen.getByText("First Mission")).toBeInTheDocument();
      expect(screen.queryByText("Second Mission")).not.toBeInTheDocument();
    });
  });
});
