import { render, screen } from "@testing-library/react";
import { HeroProfile } from "@/components/gamification/HeroProfile";

describe("HeroProfile Component", () => {
  const defaultProps = {
    level: 1,
    xp: 50,
    nextLevelXP: 100,
    totalMissions: 5,
    completedMissions: 2,
  };

  describe("Rendering", () => {
    it("should render level correctly", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should render current XP", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("50")).toBeInTheDocument();
    });

    it("should render next level XP threshold", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("100 XP")).toBeInTheDocument();
    });

    it("should render total missions count", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should render completed missions count", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("XP Progress Bar", () => {
    it("should display progress bar with correct width", () => {
      const { container } = render(
        <HeroProfile {...defaultProps} xp={50} nextLevelXP={100} />
      );

      const progressBar = container.querySelector('div[style*="width"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe("Labels", () => {
    it("should render 'Level' label", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("Level")).toBeInTheDocument();
    });

    it("should render 'Missions' label", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getAllByText("Missions")[0]).toBeInTheDocument();
    });

    it("should render 'Finished' label", () => {
      render(<HeroProfile {...defaultProps} />);

      expect(screen.getByText("Finished")).toBeInTheDocument();
    });
  });

  describe("Different Levels", () => {
    it("should render high levels correctly", () => {
      render(<HeroProfile {...defaultProps} level={10} nextLevelXP={1000} />);

      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("1000 XP")).toBeInTheDocument();
    });
  });

  describe("Zero Values", () => {
    it("should render zero XP correctly", () => {
      render(<HeroProfile {...defaultProps} xp={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
