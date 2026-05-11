import { render, screen } from "@testing-library/react";
import { DashboardClient } from "@/app/dashboard/DashboardClient";

jest.mock("@/hooks/useMissions", () => ({
  useMissions: () => ({
    missions: [],
    addMission: jest.fn(),
    completeMission: jest.fn(),
    deleteMission: jest.fn(),
  }),
}));

jest.mock("@/hooks/useXP", () => ({
  useXP: () => ({
    xp: 0,
    level: 1,
    nextLevelXP: 100,
    gainXP: jest.fn(),
  }),
}));

describe("DashboardClient Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Render", () => {
    it("should render dashboard title", () => {
      render(<DashboardClient />);

      expect(screen.getByText("Mission Board")).toBeInTheDocument();
    });

    it("should render subtitle", () => {
      render(<DashboardClient />);

      expect(
        screen.getByText("Accept contracts and seal your destiny")
      ).toBeInTheDocument();
    });

    it("should render HeroProfile component", () => {
      render(<DashboardClient />);

      expect(screen.getByText("Level")).toBeInTheDocument();
    });

    it("should render Active Contracts section", () => {
      render(<DashboardClient />);

      expect(screen.getByText("Active Contracts")).toBeInTheDocument();
    });

    it("should render empty state", () => {
      render(<DashboardClient />);

      expect(screen.getByText("No Pending Contracts")).toBeInTheDocument();
    });

    it("should render FAB button", () => {
      render(<DashboardClient />);

      expect(screen.getByText("Accept New Contract")).toBeInTheDocument();
    });
  });

  describe("Pending Count", () => {
    it("should show 0 pending when no missions", () => {
      render(<DashboardClient />);

      expect(screen.getByText("0 pending")).toBeInTheDocument();
    });
  });
});
