import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import App from "../src/App.tsx";
import { createPresignedUrl } from "../src/components/createPresignedUrl.tsx";
import { listAllObjectKeys } from "../src/components/listAllObjectKeys.tsx";

// 모듈을 모의(mock)하여 실제 API 호출을 방지합니다.
vi.mock("../src/components/listAllObjectKeys");
vi.mock("../src/components/createPresignedUrl");

describe("App Component", () => {
  // 테스트 1: 로딩 상태를 올바르게 표시하는지 확인
  it('should display "Loading images..." initially', () => {
    // listAllObjectKeys 함수가 아직 해결되지 않은 Promise를 반환하도록 모의
    vi.mocked(listAllObjectKeys).mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByText("Loading images...")).toBeInTheDocument();
  });

  // 테스트 2: 이미지 URL을 성공적으로 가져와 표시하는지 확인
  it("should display images on successful data fetch", async () => {
    // API 호출이 성공했을 때 반환할 가상의 데이터 설정
    const mockKeys = ["image1.jpg", "image2.png"];
    const mockUrls = [
      "http://mock.url/image1.jpg",
      "http://mock.url/image2.png",
    ];

    vi.mocked(listAllObjectKeys).mockResolvedValue(mockKeys);
    vi.mocked(createPresignedUrl).mockResolvedValue(mockUrls);

    render(<App />);

    // 비동기 작업이 완료될 때까지 기다림
    await waitFor(() => {
      expect(screen.queryByText("Loading images...")).toBeNull();
    });

    // 화면에 이미지들이 올바르게 렌더링되었는지 확인
    expect(screen.getByAltText("Image 0")).toBeInTheDocument();
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
    expect(screen.getByText("S3 Image")).toBeInTheDocument();
  });

  // 테스트 3: 이미지 키가 없을 때 "No images found."를 표시하는지 확인
  it('should display "No images found." when no images are present', async () => {
    // listAllObjectKeys가 빈 배열을 반환하도록 설정
    vi.mocked(listAllObjectKeys).mockResolvedValue([]);
    vi.mocked(createPresignedUrl).mockResolvedValue([]);

    render(<App />);

    // 비동기 작업 완료 대기
    await waitFor(() => {
      expect(screen.queryByText("Loading images...")).toBeNull();
    });

    // "No images found." 메시지가 화면에 있는지 확인
    expect(screen.getByText("No images found.")).toBeInTheDocument();
  });

  // 테스트 4: API 호출 실패 시 에러 메시지를 표시하는지 확인
  it("should display an error message on API fetch failure", async () => {
    // API 호출이 실패(에러)를 반환하도록 설정
    vi.mocked(listAllObjectKeys).mockRejectedValue(new Error("API failed"));

    render(<App />);

    // 에러 상태로 전환될 때까지 기다림
    await waitFor(() => {
      expect(screen.queryByText("Loading images...")).toBeNull();
    });

    // 에러 메시지가 화면에 있는지 확인
    expect(
      screen.getByText("Error: Failed to load images.")
    ).toBeInTheDocument();
  });
});
