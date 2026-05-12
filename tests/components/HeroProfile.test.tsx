import { render, screen, within } from "@testing-library/react";
import { HeroProfile } from "@/components/gamification/HeroProfile";
import { formatVoidCredits } from "@/lib/utils";

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

  describe("Rank titles", () => {
    it("should show forsaken tier at level 1", () => {
      render(<HeroProfile {...defaultProps} level={1} />);

      expect(screen.getByText("The Forsaken")).toBeInTheDocument();
      expect(screen.getByText("El Abandonado")).toBeInTheDocument();
    });

    it("should show sellsword tier at level 6", () => {
      render(<HeroProfile {...defaultProps} level={6} nextLevelXP={600} />);

      expect(screen.getByText("Sellsword")).toBeInTheDocument();
      expect(screen.getByText("Mercenario")).toBeInTheDocument();
    });

    it("should show rank ascended banner when rankUpActive", () => {
      render(<HeroProfile {...defaultProps} rankUpActive />);

      expect(
        screen.getByText(/Rank ascended — your title has evolved/i),
      ).toBeInTheDocument();
    });
  });

  describe("Streak widget", () => {
    it("should show streak label and count", () => {
      render(<HeroProfile {...defaultProps} currentStreak={4} />);

      expect(screen.getByText("Racha")).toBeInTheDocument();
      const streakStatus = screen.getByRole("status", { name: /Racha: 4 días/i });
      expect(within(streakStatus).getByText("4")).toBeInTheDocument();
    });

    it("should expose at-risk streak in aria-label", () => {
      render(
        <HeroProfile {...defaultProps} currentStreak={3} streakAtRisk />,
      );

      expect(
        screen.getByRole("status", {
          name: /Racha en riesgo: 3 días/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Different Levels", () => {
    it("shows Void Credits when voidCreditsDisplay is set", () => {
      render(<HeroProfile {...defaultProps} voidCreditsDisplay={1240} />);

      expect(screen.getByText("Void Credits")).toBeInTheDocument();
      expect(screen.getByText(formatVoidCredits(1240))).toBeInTheDocument();
    });

    it("should render high levels correctly", () => {
      render(<HeroProfile {...defaultProps} level={10} nextLevelXP={1000} />);

      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("1000 XP")).toBeInTheDocument();
    });
  });

  describe("Zero Values", () => {
    it("should render zero XP correctly", () => {
      render(<HeroProfile {...defaultProps} xp={0} />);

      const xpHeaderRow = screen.getByText("100 XP").closest("div");
      expect(xpHeaderRow).toBeTruthy();
      expect(within(xpHeaderRow!).getByText("0")).toBeInTheDocument();
    });
  });
});
