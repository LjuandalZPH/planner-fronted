import { render, screen, fireEvent } from "@testing-library/react";
import { MissionList } from "@/components/mission/MissionList";
import type { Mission } from "@/components/mission/MissionCard";

describe("MissionList Component", () => {
  const mockMissions: Mission[] = [
    {
      id: "mission-1",
      title: "First Mission",
      description: "Description 1",
      rarity: "epic",
      progress: 25,
    },
    {
      id: "mission-2",
      title: "Second Mission",
      description: "Description 2",
      rarity: "legendary",
      progress: 75,
    },
  ];

  describe("Empty State", () => {
    it("should render empty state message when no missions", () => {
      render(<MissionList missions={[]} playerLevel={1} />);

      expect(screen.getByText("No Pending Contracts")).toBeInTheDocument();
    });

    it("should render instruction text", () => {
      render(<MissionList missions={[]} playerLevel={1} />);

      expect(
        screen.getByText(/Press the "Accept New Contract" button/i)
      ).toBeInTheDocument();
    });
  });

  describe("With Missions", () => {
    it("should render all missions", () => {
      render(<MissionList missions={mockMissions} playerLevel={1} />);

      expect(screen.getByText("First Mission")).toBeInTheDocument();
      expect(screen.getByText("Second Mission")).toBeInTheDocument();
    });

    it("should pass onComplete callback to MissionCard", () => {
      const onComplete = jest.fn();
      render(
        <MissionList missions={mockMissions} onComplete={onComplete} playerLevel={1} />,
      );

      const sealButtons = screen.getAllByText("Seal Contract");
      fireEvent.click(sealButtons[0]);

      expect(onComplete).toHaveBeenCalledWith("mission-1");
    });

    it("should pass onDelete callback to MissionCard", () => {
      const onDelete = jest.fn();
      render(
        <MissionList missions={mockMissions} onDelete={onDelete} playerLevel={1} />,
      );

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
          playerLevel={1}
        />
      );

      const mission2Card = screen.getByText("Second Mission").closest("article");
      const sealButton = mission2Card?.querySelector("button");
      expect(sealButton).toBeDisabled();
    });
  });

  describe("Single Mission", () => {
    it("should render single mission correctly", () => {
      render(<MissionList missions={[mockMissions[0]]} playerLevel={1} />);

      expect(screen.getByText("First Mission")).toBeInTheDocument();
      expect(screen.queryByText("Second Mission")).not.toBeInTheDocument();
    });
  });
});
