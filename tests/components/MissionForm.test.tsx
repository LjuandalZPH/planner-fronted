import { render, screen, fireEvent } from "@testing-library/react";
import { MissionForm } from "@/components/mission/MissionForm";

describe("MissionForm Component", () => {
  describe("Form Fields", () => {
    it("should render title input", () => {
      render(<MissionForm />);

      expect(screen.getByLabelText("Mission Title")).toBeInTheDocument();
    });

    it("should render description textarea", () => {
      render(<MissionForm />);

      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("should render XP input with default value", () => {
      render(<MissionForm />);

      const xpInput = screen.getByLabelText("Bounty XP") as HTMLInputElement;
      expect(xpInput.value).toBe("10");
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit with form data when submitted", () => {
      const onSubmit = jest.fn();
      render(<MissionForm onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText("Mission Title"), {
        target: { value: "New Mission" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "Mission Description" },
      });
      fireEvent.change(screen.getByLabelText("Bounty XP"), {
        target: { value: "50" },
      });

      fireEvent.click(screen.getByText("Accept Contract"));

      expect(onSubmit).toHaveBeenCalledWith({
        title: "New Mission",
        description: "Mission Description",
        xp: 50,
      });
    });

    it("should trim whitespace from title", () => {
      const onSubmit = jest.fn();
      render(<MissionForm onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText("Mission Title"), {
        target: { value: "  Trimmed Title  " },
      });

      fireEvent.click(screen.getByText("Accept Contract"));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Trimmed Title" })
      );
    });

    it("should not submit if title is empty", () => {
      const onSubmit = jest.fn();
      render(<MissionForm onSubmit={onSubmit} />);

      fireEvent.click(screen.getByText("Accept Contract"));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should submit with trimmed description", () => {
      const onSubmit = jest.fn();
      render(<MissionForm onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText("Mission Title"), {
        target: { value: "Valid Title" },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "  Description with spaces  " },
      });

      fireEvent.click(screen.getByText("Accept Contract"));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ description: "Description with spaces" })
      );
    });
  });

  describe("XP Validation", () => {
    it("should submit with default XP value", () => {
      const onSubmit = jest.fn();
      render(<MissionForm onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText("Mission Title"), {
        target: { value: "Test Mission" },
      });

      fireEvent.click(screen.getByText("Accept Contract"));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ xp: 10 })
      );
    });
  });

  describe("Cancel Button", () => {
    it("should render cancel button when onCancel provided", () => {
      const onCancel = jest.fn();
      render(<MissionForm onCancel={onCancel} />);

      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should call onCancel when cancel is clicked", () => {
      const onCancel = jest.fn();
      render(<MissionForm onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Cancel"));

      expect(onCancel).toHaveBeenCalled();
    });

    it("should not render cancel button when onCancel not provided", () => {
      render(<MissionForm />);

      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });
  });

  describe("Submitting State", () => {
    it("should show loading text when isSubmitting is true", () => {
      render(<MissionForm isSubmitting={true} />);

      expect(screen.getByText("Creando...")).toBeInTheDocument();
    });

    it("should disable button when title is empty", () => {
      render(<MissionForm />);

      const button = screen.getByText("Accept Contract");
      expect(button).toBeDisabled();
    });
  });
});
